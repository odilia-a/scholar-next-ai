const subscriptionPlans = require(
  "../config/subscriptionPlans"
);

const checkUsage = (
  featureName,
  usageField,
  limitField
) => {
  return async (
    req,
    res,
    next
  ) => {
    try {
      const user = req.user;

      const planName =
        user.subscriptionPlan ||
        "free";

      const plan =
        subscriptionPlans[
          planName
        ];

      const limit =
        plan.limits[
          limitField
        ];

      if (!user.usage) {
        user.usage = {};
      }

      if (user.usage[usageField] === undefined) {
        user.usage[usageField] = 0;
      }

      const currentUsage = user.usage[usageField];

      // Unlimited
      if (limit === -1) {
        return next();
      }

      // Limit exceeded
      if (
        currentUsage >=
        limit
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              `Your ${planName} plan limit has been reached.`,

            upgradeRequired:
              true,
          });
      }

      // Increment usage
      user.usage[
        usageField
      ] += 1;

      await user.save();

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkUsage,
};