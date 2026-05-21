const User = require(
  "../models/User"
);

const upgradeSubscription =
  async (
    userId,
    planName
  ) => {
    const user =
      await User.findById(
        userId
      );

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    user.subscriptionPlan =
      planName;

    await user.save();

    console.log(
      `✅ User upgraded to ${planName}`
    );

    return user;
  };

module.exports =
  upgradeSubscription;