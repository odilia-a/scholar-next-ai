const featureGates = require("../config/features");

/**
 * Middleware to check if user has access to a specific feature
 * @param {string} featureName - Name of the feature (e.g., "pdfUpload", "advancedAnalysis")
 */
const hasFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      
      const plan = user.subscriptionPlan || "free";
      const feature = featureGates[plan]?.[featureName];
      
      // Feature doesn't exist or not available on this plan
      if (!feature?.enabled) {
        const availablePlans = Object.keys(featureGates).filter(
          (p) => featureGates[p][featureName]?.enabled
        );
        
        return res.status(403).json({
          success: false,
          message: `Feature "${featureName}" is not available on your ${plan} plan.`,
          requiredPlan: availablePlans[availablePlans.length - 1], // highest tier
          availablePlans,
          currentPlan: plan,
        });
      }
      
      // Attach feature info to request for later use
      req.feature = feature;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Get all features available to a user's plan
 * @param {string} plan - Subscription plan (free, gold, diamond)
 */
const getAvailableFeatures = (plan) => {
  const features = featureGates[plan] || featureGates.free;
  
  return {
    plan,
    features: Object.entries(features).reduce((acc, [name, config]) => {
      if (config.enabled) {
        acc[name] = {
          description: config.description,
          ...(config.dailyLimit !== undefined && { dailyLimit: config.dailyLimit }),
          ...(config.weeklyLimit !== undefined && { weeklyLimit: config.weeklyLimit }),
        };
      }
      return acc;
    }, {}),
    upgradeOptions: plan === "free" ? ["gold", "diamond"] : plan === "gold" ? ["diamond"] : [],
  };
};

module.exports = {
  hasFeatureAccess,
  getAvailableFeatures,
  featureGates,
};
