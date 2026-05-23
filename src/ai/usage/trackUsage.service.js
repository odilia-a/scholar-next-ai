const AIUsage = require("../../models/AIUsage");

const PROVIDER_COSTS = {
  gemini: { input: 0.000075, output: 0.0003 }, // per 1k tokens
  grok: { input: 0.0005, output: 0.0015 },
  huggingface: { input: 0.0001, output: 0.0002 },
};

/**
 * Track AI usage with cost calculation
 * @param {string} userId - User ID
 * @param {string} provider - AI provider (gemini, grok, huggingface)
 * @param {object} options - Tracking options
 * @param {number} options.inputTokens - Number of input tokens
 * @param {number} options.outputTokens - Number of output tokens
 * @param {number} options.responseTime - Response time in ms
 * @param {boolean} options.success - Whether request was successful
 * @param {string} options.error - Error message if failed
 */
const trackUsage = async (
  userId,
  provider,
  { inputTokens = 0, outputTokens = 0, responseTime = 0, success = true, error = null } = {}
) => {
  try {
    const costs = PROVIDER_COSTS[provider] || { input: 0, output: 0 };
    
    // Calculate cost in USD (tokens are in 1k units)
    const estimatedCost = (inputTokens * costs.input + outputTokens * costs.output) / 1000;
    
    const now = new Date();
    
    const update = {
      $inc: {
        count: 1,
        "costBreakdown.inputTokens": inputTokens,
        "costBreakdown.outputTokens": outputTokens,
        "costBreakdown.estimatedCostUSD": estimatedCost,
        totalCost: estimatedCost,
        totalRequestTime: responseTime,
        ...(success ? { successCount: 1 } : { failureCount: 1 }),
      },
      $set: {
        lastUsed: now,
        ...(error && { lastError: error, lastErrorTime: now }),
      },
      $setOnInsert: {
        user: userId,
        provider,
        firstUsed: now,
      },
    };
    
    const usage = await AIUsage.findOneAndUpdate(
      { user: userId, provider },
      update,
      { upsert: true, new: true }
    );
    
    // Update average response time
    if (usage.count > 0 && responseTime > 0) {
      usage.averageResponseTime = usage.totalRequestTime / usage.count;
      
      // Update min/max response times
      if (responseTime < usage.minResponseTime) {
        usage.minResponseTime = responseTime;
      }
      if (responseTime > usage.maxResponseTime) {
        usage.maxResponseTime = responseTime;
      }
      
      await usage.save();
    }
    
    return usage;
  } catch (err) {
    console.error("trackUsage error:", err);
    throw err;
  }
};

module.exports = trackUsage;