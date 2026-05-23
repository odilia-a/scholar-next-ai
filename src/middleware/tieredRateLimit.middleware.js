const rateLimit = require("express-rate-limit");
const subscriptionPlans = require("../config/subscriptionPlans");

/**
 * Tier-based rate limiter that adjusts limits based on subscription plan
 * Falls back to in-memory store if Redis not available
 */
const createTieredLimiter = (plan) => {
  const limits = {
    free: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 requests per 15 min
      message: "Too many requests from free tier. Please upgrade your plan.",
    },
    gold: {
      windowMs: 15 * 60 * 1000,
      max: 200,
      message: "Too many requests from gold tier. Please try again later.",
    },
    diamond: {
      windowMs: 15 * 60 * 1000,
      max: 2000,
      message: "Rate limit exceeded. Contact support if issue persists.",
    },
  };

  const config = limits[plan] || limits.free;

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?._id?.toString() || req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user?.role === "admin";
    },
    statusCode: 429,
  });
};

/**
 * Middleware that applies tier-based rate limiting
 */
const tierBasedAiLimiter = (req, res, next) => {
  const plan = req.user?.subscriptionPlan || "free";
  const limiter = createTieredLimiter(plan);
  limiter(req, res, next);
};

/**
 * Separate limiter for AI routes (more restrictive)
 */
const tierBasedApiLimiter = (req, res, next) => {
  const plan = req.user?.subscriptionPlan || "free";
  
  const aiLimits = {
    free: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 AI requests per hour
    },
    gold: {
      windowMs: 60 * 60 * 1000,
      max: 100,
    },
    diamond: {
      windowMs: 60 * 60 * 1000,
      max: 1000,
    },
  };

  const config = aiLimits[plan] || aiLimits.free;

  const limiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: `AI rate limit reached for ${plan} plan. Upgrade for higher limits.`,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    skip: (req) => req.user?.role === "admin",
  });

  limiter(req, res, next);
};

/**
 * Auth limiter (same for all users to prevent brute force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || req.ip,
});

module.exports = {
  tierBasedAiLimiter,
  tierBasedApiLimiter,
  authLimiter,
  createTieredLimiter,
};
