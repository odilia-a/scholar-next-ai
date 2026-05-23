const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const protect = require("../middleware/auth.middleware");
const { checkUsage, checkSubscriptionStatus } = require("../middleware/subscription.middleware");
const { hasFeatureAccess } = require("../middleware/featureGate.middleware");
const { tierBasedAiLimiter } = require("../middleware/tieredRateLimit.middleware");

const { askAI } = require("../controllers/ai.controller");

console.log("upload:", upload);
console.log("protect:", protect);
console.log("checkUsage:", checkUsage);
console.log("askAI:", askAI);

// AI request route with tier-based rate limiting and feature gating
router.post(
  "/chat",
  upload.single("file"),
  protect,
  checkSubscriptionStatus, // Auto-downgrade expired subscriptions
  tierBasedAiLimiter, // Tier-based rate limiting
  checkUsage("AI", "aiRequestsToday", "aiRequestsPerDay"),
  hasFeatureAccess("chat"), // Feature gate
  askAI
);

// Advanced analysis route (requires gold or diamond)
router.post(
  "/analyze-advanced",
  upload.single("file"),
  protect,
  checkSubscriptionStatus,
  tierBasedAiLimiter,
  hasFeatureAccess("advancedAnalysis"),
  checkUsage("AI", "aiRequestsToday", "aiRequestsPerDay"),
  askAI
);

// PDF upload and analysis (requires gold or diamond for multiple weekly uploads)
router.post(
  "/pdf-upload",
  upload.single("pdf"),
  protect,
  checkSubscriptionStatus,
  hasFeatureAccess("pdfUpload"),
  checkUsage("PDF", "pdfUploadsThisWeek", "pdfUploadsPerWeek"),
  askAI
);

// Translation route
router.post(
  "/translate",
  protect,
  checkSubscriptionStatus,
  tierBasedAiLimiter,
  checkUsage("Translation", "translationsToday", "translationsPerDay"),
  hasFeatureAccess("translation"),
  askAI
);

// Export results (requires gold or diamond)
router.post(
  "/export",
  protect,
  checkSubscriptionStatus,
  hasFeatureAccess("exportResults"),
  askAI
);

// API access (diamond only)
router.post(
  "/api-access",
  protect,
  checkSubscriptionStatus,
  hasFeatureAccess("apiAccess"),
  askAI
);

module.exports = router;