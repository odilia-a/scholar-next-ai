const mongoose = require("mongoose");

/**
 * Retry settings
 */
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

let retries = 0;

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected Successfully");

    retries = 0; // reset on success
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);

    retries += 1;

    if (retries <= MAX_RETRIES) {
      console.log(
        `🔁 Retrying MongoDB connection... (${retries}/${MAX_RETRIES})`
      );

      setTimeout(connectDB, RETRY_DELAY);
    } else {
      console.error("Max retries reached. Exiting process.");
      process.exit(1);
    }
  }
};

/**
 * Handle connection events
 */
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
  connectDB();
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

module.exports = connectDB;