const AIUsage = require("../../models/AIUsage");

const trackUsage = async (userId, provider) => {
  await AIUsage.findOneAndUpdate(
    { user: userId, provider },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        count: 0,
        createdAt: new Date(),
      },
      $set: {
        lastUsed: new Date(),
      },
    },
    { upsert: true, new: true }
  );
};

module.exports = trackUsage;