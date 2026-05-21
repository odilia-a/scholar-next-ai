const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["paystack", "flutterwave", "paypal"],
      required: true,
    },

    eventId: {
      type: String,
      required: true,
      unique: true,
    },

    processed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "WebhookEvent",
  webhookEventSchema
);