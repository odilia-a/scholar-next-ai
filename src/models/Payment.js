const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      enum: ["paystack", "flutterwave", "paypal"],
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "gold", "diamond"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      enum: ["NGN", "USD", "EUR", "GBP"],
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "gold", "diamond"],
      required: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    reference: {
      type: String,
    },

    rawResponse: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);