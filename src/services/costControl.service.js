const CostTracker = require("../models/CostTracker");
const User = require("../models/User");

const PROVIDER_COSTS = {
  gemini: { input: 0.000075, output: 0.0003 },
  grok: { input: 0.0005, output: 0.0015 },
  huggingface: { input: 0.0001, output: 0.0002 },
};

/**
 * Track cost for API usage
 * @param {string} userId - User ID
 * @param {string} provider - AI provider
 * @param {number} inputTokens - Input tokens count
 * @param {number} outputTokens - Output tokens count
 */
const trackCost = async (userId, provider, { inputTokens = 0, outputTokens = 0 }) => {
  try {
    const costs = PROVIDER_COSTS[provider] || { input: 0, output: 0 };
    const costUSD = (inputTokens * costs.input + outputTokens * costs.output) / 1000;

    // Get start of today (daily tracking)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of month (monthly tracking)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Update daily cost
    const dailyTracker = await CostTracker.findOneAndUpdate(
      { user: userId, period: "daily", date: today },
      {
        $inc: {
          [`costByProvider.${provider}`]: costUSD,
          totalCost: costUSD,
          requestCount: 1,
        },
      },
      { upsert: true, new: true }
    );

    // Update monthly cost
    const monthlyTracker = await CostTracker.findOneAndUpdate(
      { user: userId, period: "monthly", date: monthStart },
      {
        $inc: {
          [`costByProvider.${provider}`]: costUSD,
          totalCost: costUSD,
          requestCount: 1,
        },
      },
      { upsert: true, new: true }
    );

    // Check budget limits and send alerts
    await checkAndAlertBudget(userId, dailyTracker, monthlyTracker);

    return {
      daily: dailyTracker,
      monthly: monthlyTracker,
    };
  } catch (err) {
    console.error("trackCost error:", err);
    throw err;
  }
};

/**
 * Check budget limits and send alerts if threshold exceeded
 */
const checkAndAlertBudget = async (userId, dailyTracker, monthlyTracker) => {
  try {
    const user = await User.findById(userId).select("email subscriptionPlan");
    if (!user) return;

    // Check daily budget
    if (dailyTracker.budgetLimit && dailyTracker.totalCost > dailyTracker.budgetLimit) {
      if (!dailyTracker.alertSent) {
        await sendBudgetAlert(user, dailyTracker, "daily");
        dailyTracker.alertSent = true;
        dailyTracker.alertSentAt = new Date();
        dailyTracker.budgetExceeded = true;
        dailyTracker.budgetExceededAt = new Date();
        await dailyTracker.save();
      }
    }

    // Check threshold (e.g., 80% of budget)
    if (
      dailyTracker.budgetLimit &&
      dailyTracker.totalCost >= dailyTracker.budgetLimit * dailyTracker.alertThreshold &&
      !dailyTracker.alertSent
    ) {
      await sendThresholdAlert(user, dailyTracker, "daily");
      dailyTracker.alertSent = true;
      dailyTracker.alertSentAt = new Date();
      await dailyTracker.save();
    }

    // Check monthly budget
    if (monthlyTracker.budgetLimit && monthlyTracker.totalCost > monthlyTracker.budgetLimit) {
      if (!monthlyTracker.alertSent) {
        await sendBudgetAlert(user, monthlyTracker, "monthly");
        monthlyTracker.alertSent = true;
        monthlyTracker.alertSentAt = new Date();
        monthlyTracker.budgetExceeded = true;
        monthlyTracker.budgetExceededAt = new Date();
        await monthlyTracker.save();
      }
    }

    // Check monthly threshold
    if (
      monthlyTracker.budgetLimit &&
      monthlyTracker.totalCost >= monthlyTracker.budgetLimit * monthlyTracker.alertThreshold &&
      !monthlyTracker.alertSent
    ) {
      await sendThresholdAlert(user, monthlyTracker, "monthly");
      monthlyTracker.alertSent = true;
      monthlyTracker.alertSentAt = new Date();
      await monthlyTracker.save();
    }
  } catch (err) {
    console.error("checkAndAlertBudget error:", err);
  }
};

/**
 * Send budget alert email when limit exceeded
 */
const sendBudgetAlert = async (user, tracker, period) => {
  try {
    // TODO: Integrate with email service (Sendgrid, Nodemailer, etc.)
    console.log(`🚨 Budget EXCEEDED for ${user._id} - ${period} limit exceeded`);
    console.log(`Total: $${tracker.totalCost.toFixed(2)} / Limit: $${tracker.budgetLimit.toFixed(2)}`);

    // Log for audit trail
    console.log(`Alert sent at: ${new Date().toISOString()}`);
  } catch (err) {
    console.error("sendBudgetAlert error:", err);
  }
};

/**
 * Send threshold warning email (e.g., 80% of budget)
 */
const sendThresholdAlert = async (user, tracker, period) => {
  try {
    const percentage = Math.round((tracker.totalCost / tracker.budgetLimit) * 100);

    // TODO: Integrate with email service
    console.log(
      `⚠️  Budget THRESHOLD for ${user._id} - ${period} at ${percentage}% of limit`
    );
    console.log(`Spent: $${tracker.totalCost.toFixed(2)} / Limit: $${tracker.budgetLimit.toFixed(2)}`);
  } catch (err) {
    console.error("sendThresholdAlert error:", err);
  }
};

/**
 * Get cost for a specific day
 */
const getDailyCost = async (userId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  return await CostTracker.findOne({
    user: userId,
    period: "daily",
    date: startOfDay,
  });
};

/**
 * Get cost for a specific month
 */
const getMonthlyCost = async (userId, month, year) => {
  const monthStart = new Date(year, month - 1, 1);
  monthStart.setHours(0, 0, 0, 0);

  return await CostTracker.findOne({
    user: userId,
    period: "monthly",
    date: monthStart,
  });
};

/**
 * Get cost summary for a date range
 */
const getCostSummary = async (userId, startDate, endDate) => {
  const costs = await CostTracker.find({
    user: userId,
    period: "daily",
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  const summary = {
    totalCost: 0,
    costByProvider: {
      gemini: 0,
      grok: 0,
      huggingface: 0,
      other: 0,
    },
    totalRequests: 0,
    averageDailyCost: 0,
    costsByDate: {},
  };

  costs.forEach((cost) => {
    summary.totalCost += cost.totalCost;
    summary.totalRequests += cost.requestCount;

    Object.keys(cost.costByProvider).forEach((provider) => {
      summary.costByProvider[provider] += cost.costByProvider[provider];
    });

    summary.costsByDate[cost.date.toISOString().split("T")[0]] = {
      total: cost.totalCost,
      providers: cost.costByProvider,
      requests: cost.requestCount,
    };
  });

  if (costs.length > 0) {
    summary.averageDailyCost = summary.totalCost / costs.length;
  }

  return summary;
};

/**
 * Set budget limit for user
 */
const setBudgetLimit = async (userId, period, limitUSD) => {
  try {
    if (period === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await CostTracker.findOneAndUpdate(
        { user: userId, period: "daily", date: today },
        {
          budgetLimit: limitUSD,
          $setOnInsert: {
            date: today,
            period: "daily",
          },
        },
        { upsert: true, new: true }
      );
    }

    if (period === "monthly") {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      return await CostTracker.findOneAndUpdate(
        { user: userId, period: "monthly", date: monthStart },
        {
          budgetLimit: limitUSD,
          $setOnInsert: {
            date: monthStart,
            period: "monthly",
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error("setBudgetLimit error:", err);
    throw err;
  }
};

/**
 * Get provider cost breakdown
 */
const getProviderCosts = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const costs = await CostTracker.find({
    user: userId,
    period: "daily",
    date: { $gte: startDate },
  });

  const breakdown = {
    gemini: { cost: 0, requests: 0 },
    grok: { cost: 0, requests: 0 },
    huggingface: { cost: 0, requests: 0 },
    other: { cost: 0, requests: 0 },
  };

  costs.forEach((cost) => {
    Object.keys(breakdown).forEach((provider) => {
      breakdown[provider].cost += cost.costByProvider[provider] || 0;
    });
  });

  return breakdown;
};

module.exports = {
  trackCost,
  getDailyCost,
  getMonthlyCost,
  getCostSummary,
  setBudgetLimit,
  getProviderCosts,
  checkAndAlertBudget,
};
