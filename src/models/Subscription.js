const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    plan: {
      type: String,
      enum: ["free", "gold", "diamond"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },

    provider: {
      type: String,
      enum: ["paystack", "flutterwave", "paypal"],
    },

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);