const CostTracker = require("../models/CostTracker");
const User = require("../models/User");
const { getCostSummary, setBudgetLimit, getProviderCosts } = require("../services/costControl.service");

/**
 * Get cost reports for a specific user
 */
const getCostReports = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, period = "daily" } = req.query;

    const query = { user: userId, period };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await CostTracker.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        user: userId,
        period,
        reports,
        totalRecords: reports.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cost summary for a user over a date range
 */
const getUserCostSummary = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const summary = await getCostSummary(userId, startDate, endDate);
    const user = await User.findById(userId).select("email name subscriptionPlan");

    res.json({
      success: true,
      data: {
        user: {
          _id: userId,
          name: user?.name,
          email: user?.email,
          plan: user?.subscriptionPlan,
        },
        period: `Last ${days} days`,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system-wide cost metrics
 */
const getSystemCostMetrics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all costs for the period
    const allCosts = await CostTracker.aggregate([
      {
        $match: {
          period: "daily",
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSystemCost: { $sum: "$totalCost" },
          totalRequests: { $sum: "$requestCount" },
          avgDailyCost: { $avg: "$totalCost" },
          maxDailyCost: { $max: "$totalCost" },
          minDailyCost: { $min: "$totalCost" },
          geminiCost: { $sum: "$costByProvider.gemini" },
          grokCost: { $sum: "$costByProvider.grok" },
          huggingfaceCost: { $sum: "$costByProvider.huggingface" },
          otherCost: { $sum: "$costByProvider.other" },
        },
      },
    ]);

    // Get unique active users
    const activeUsers = await CostTracker.distinct("user", {
      period: "daily",
      date: { $gte: startDate },
    });

    // Get alerts sent
    const alertsSent = await CostTracker.countDocuments({
      alertSent: true,
      alertSentAt: { $gte: startDate },
    });

    const metrics = allCosts[0] || {
      totalSystemCost: 0,
      totalRequests: 0,
      avgDailyCost: 0,
      maxDailyCost: 0,
      minDailyCost: 0,
      geminiCost: 0,
      grokCost: 0,
      huggingfaceCost: 0,
      otherCost: 0,
    };

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        metrics: {
          ...metrics,
          activeUsers: activeUsers.length,
          alertsSent,
          costPerUser: metrics.totalSystemCost / (activeUsers.length || 1),
          requestsPerUser: metrics.totalRequests / (activeUsers.length || 1),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set budget limit for a user
 */
const setBudget = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { daily, monthly, alertThreshold = 0.8 } = req.body;

    if (!daily && !monthly) {
      return res.status(400).json({
        success: false,
        message: "Please provide daily or monthly budget",
      });
    }

    const updates = [];

    if (daily !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      updates.push(
        CostTracker.findOneAndUpdate(
          { user: userId, period: "daily", date: today },
          {
            budgetLimit: daily,
            alertThreshold,
            $setOnInsert: { date: today, period: "daily" },
          },
          { upsert: true, new: true }
        )
      );
    }

    if (monthly !== undefined) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      updates.push(
        CostTracker.findOneAndUpdate(
          { user: userId, period: "monthly", date: monthStart },
          {
            budgetLimit: monthly,
            alertThreshold,
            $setOnInsert: { date: monthStart, period: "monthly" },
          },
          { upsert: true, new: true }
        )
      );
    }

    const results = await Promise.all(updates);

    res.json({
      success: true,
      message: "Budget limits updated",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top spenders
 */
const getTopSpenders = async (req, res, next) => {
  try {
    const { days = 30, limit = 10 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const topSpenders = await CostTracker.aggregate([
      {
        $match: {
          period: "daily",
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$user",
          totalCost: { $sum: "$totalCost" },
          totalRequests: { $sum: "$requestCount" },
          avgDailyCost: { $avg: "$totalCost" },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          user: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          plan: "$userInfo.subscriptionPlan",
          totalCost: 1,
          totalRequests: 1,
          avgDailyCost: 1,
          costPerRequest: { $divide: ["$totalCost", "$totalRequests"] },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        topSpenders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCostReports,
  getUserCostSummary,
  getSystemCostMetrics,
  setBudget,
  getTopSpenders,
};
