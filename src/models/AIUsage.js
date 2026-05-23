const mongoose = require("mongoose");

const aiUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["gemini", "grok", "huggingface", "paypal"],
      required: true,
      index: true,
    },

    // Basic counters
    count: {
      type: Number,
      default: 0,
    },

    // Cost tracking
    totalCost: {
      type: Number,
      default: 0,
      index: true,
    },

    costBreakdown: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      estimatedCostUSD: { type: Number, default: 0 },
    },

    // Performance metrics
    averageResponseTime: { type: Number, default: 0 }, // ms
    totalRequestTime: { type: Number, default: 0 }, // ms
    minResponseTime: { type: Number, default: Infinity },
    maxResponseTime: { type: Number, default: 0 },

    // Error tracking
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    lastError: String,
    lastErrorTime: Date,

    // Last used timestamp
    lastUsed: {
      type: Date,
      default: Date.now,
    },

    // For tracking first usage
    firstUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for quick lookups by user and provider
aiUsageSchema.index({ user: 1, provider: 1 });

// Index for cost reporting
aiUsageSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model("AIUsage", aiUsageSchema);