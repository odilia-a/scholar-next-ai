const mongoose = require("mongoose");

const costTrackerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    period: {
      type: String,
      enum: ["daily", "monthly"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    costByProvider: {
      gemini: { type: Number, default: 0 },
      grok: { type: Number, default: 0 },
      huggingface: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    totalCost: {
      type: Number,
      default: 0,
      index: true,
    },

    requestCount: {
      type: Number,
      default: 0,
    },

    budgetLimit: {
      type: Number,
      default: null, // USD per period
    },

    alertThreshold: {
      type: Number,
      default: 0.8, // 80% of budget
    },

    alertSent: {
      type: Boolean,
      default: false,
    },

    alertSentAt: Date,

    // For tracking budget overage
    budgetExceeded: {
      type: Boolean,
      default: false,
    },

    budgetExceededAt: Date,
  },
  { timestamps: true }
);

// Compound index for efficient lookups
costTrackerSchema.index({ user: 1, date: 1, period: 1 });
costTrackerSchema.index({ user: 1, period: 1, createdAt: -1 });

module.exports = mongoose.model("CostTracker", costTrackerSchema);
