const subscriptionPlans = require("../config/subscriptionPlans");
const User = require("../models/User");

// Reset daily usage counters if 24 hours have passed
const resetDailyUsage = async (user) => {
  if (!user.usage) user.usage = {};
  
  const now = new Date();
  const lastReset = user.usage?.lastDailyReset || new Date(0);
  const timeSinceReset = now - new Date(lastReset);
  
  // Reset if 24 hours have passed
  if (timeSinceReset > 24 * 60 * 60 * 1000) {
    user.usage.aiRequestsToday = 0;
    user.usage.quizzesToday = 0;
    user.usage.translationsToday = 0;
    user.usage.lastDailyReset = now;
  }
  
  return user;
};

// Reset weekly usage counters if 7 days have passed
const resetWeeklyUsage = async (user) => {
  if (!user.usage) user.usage = {};
  
  const now = new Date();
  const lastReset = user.usage?.lastWeeklyReset || new Date(0);
  const timeSinceReset = now - new Date(lastReset);
  
  // Reset if 7 days have passed
  if (timeSinceReset > 7 * 24 * 60 * 60 * 1000) {
    user.usage.pdfUploadsThisWeek = 0;
    user.usage.lastWeeklyReset = now;
  }
  
  return user;
};

// Check if subscription has expired and downgrade to free
const checkSubscriptionStatus = async (user) => {
  if (user.subscriptionExpiresAt && new Date() > new Date(user.subscriptionExpiresAt)) {
    user.subscriptionPlan = "free";
    user.subscriptionExpiresAt = null;
    await user.save();
  }
  return user;
};

const checkUsage = (featureName, usageField, limitField) => {
  return async (req, res, next) => {
    try {
      let user = req.user;
      
      // Check subscription status first (auto-downgrade if expired)
      await checkSubscriptionStatus(user);
      
      const planName = user.subscriptionPlan || "free";
      const plan = subscriptionPlans[planName];
      const limit = plan.limits[limitField];
      
      // Initialize usage object if missing
      if (!user.usage) {
        user.usage = {};
      }
      
      // Reset daily counters if needed
      if (limitField.includes("Today")) {
        user = await resetDailyUsage(user);
      }
      
      // Reset weekly counters if needed
      if (limitField.includes("Week")) {
        user = await resetWeeklyUsage(user);
      }
      
      if (user.usage[usageField] === undefined) {
        user.usage[usageField] = 0;
      }
      
      const currentUsage = user.usage[usageField];
      
      // Unlimited (-1 means no limit)
      if (limit === -1) {
        return next();
      }
      
      // Check if limit exceeded
      if (currentUsage >= limit) {
        return res.status(403).json({
          success: false,
          message: `Your ${planName} plan limit (${currentUsage}/${limit}) has been reached for ${limitField}.`,
          currentUsage,
          limit,
          limitType: limitField,
          plan: planName,
          upgradeRequired: true,
        });
      }
      
      // Increment usage with atomic operation
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { ["usage." + usageField]: 1 },
          $set: { "usage.lastUpdated": new Date() },
        },
        { new: true, runValidators: false }
      );
      
      // Update req.user with latest data
      req.user = updatedUser;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkUsage,
  checkSubscriptionStatus,
  resetDailyUsage,
  resetWeeklyUsage,
};