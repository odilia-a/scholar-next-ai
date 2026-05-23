const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");

// Create redis client from env or fallback to null
let redisClient = null;
try {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    redisClient = new Redis(redisUrl);
  } else if (process.env.REDIS_HOST) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }
} catch (err) {
  console.warn("Redis client initialization failed, falling back to in-memory limiter:", err.message);
  redisClient = null;
}

const buildLimiter = ({ windowMs, max, message, prefix }) => {
  const options = {
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    skip: (req) => req.user?.role === "admin",
    statusCode: 429,
  };

  if (redisClient) {
    options.store = new RedisStore({ client: redisClient, prefix: prefix || "rate-limit:" });
  }

  return rateLimit(options);
};

// Tiered limiters
const limiters = {
  free: buildLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many requests from free tier. Please upgrade your plan.", prefix: "free:" }),
  gold: buildLimiter({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests from gold tier. Please try again later.", prefix: "gold:" }),
  diamond: buildLimiter({ windowMs: 15 * 60 * 1000, max: 2000, message: "Rate limit exceeded. Contact support if issue persists.", prefix: "diamond:" }),
};

// AI-specific limits (hourly)
const aiLimiters = {
  free: buildLimiter({ windowMs: 60 * 60 * 1000, max: 10, message: "AI rate limit reached for free plan.", prefix: "ai:free:" }),
  gold: buildLimiter({ windowMs: 60 * 60 * 1000, max: 100, message: "AI rate limit reached for gold plan.", prefix: "ai:gold:" }),
  diamond: buildLimiter({ windowMs: 60 * 60 * 1000, max: 1000, message: "AI rate limit reached for diamond plan.", prefix: "ai:diamond:" }),
};

// Middleware that applies tier-based rate limiting
const tierBasedAiLimiter = (req, res, next) => {
  const plan = req.user?.subscriptionPlan || "free";
  const limiter = limiters[plan] || limiters.free;
  limiter(req, res, next);
};

const tierBasedApiLimiter = (req, res, next) => {
  const plan = req.user?.subscriptionPlan || "free";
  const limiter = aiLimiters[plan] || aiLimiters.free;
  limiter(req, res, next);
};

// Auth limiter (same for all users to prevent brute force)
const authLimiter = buildLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many login attempts. Try again after 15 minutes.", prefix: "auth:" });

module.exports = {
  tierBasedAiLimiter,
  tierBasedApiLimiter,
  authLimiter,
  redisClient,
};
