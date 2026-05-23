require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const { sendTestAlert } = require("../services/costControl.service");

const run = async () => {
  try {
    await connectDB();

    const testEmail = process.env.TEST_ALERT_EMAIL;

    let targetEmail = testEmail;
    if (!targetEmail) {
      // Try to find an admin user
      const admin = await User.findOne({ role: "admin" }).select("email");
      if (admin && admin.email) targetEmail = admin.email;
    }

    if (!targetEmail) {
      console.error("No TEST_ALERT_EMAIL set and no admin user found. Set TEST_ALERT_EMAIL in env.");
      process.exit(1);
    }

    console.log(`Sending test alert to ${targetEmail}...`);
    const result = await sendTestAlert(targetEmail);
    console.log("Result:", result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
};

run();
