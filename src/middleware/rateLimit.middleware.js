const rateLimit = require("express-rate-limit");

// General API protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// AI protection (EXPENSIVE ROUTES)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "AI limit reached. Upgrade your plan.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict auth protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts.",
});

module.exports = {
  apiLimiter,
  aiLimiter,
  authLimiter,
};