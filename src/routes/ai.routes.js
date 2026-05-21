const express = require(
  "express"
);

const router =
  express.Router();

const upload =
  require(
    "../middleware/upload.middleware"
  );

const protect = require(
  "../middleware/auth.middleware"
);

const {
  checkUsage
} = require(
  "../middleware/subscription.middleware"
);

const {
  askAI,
} = require(
  "../controllers/ai.controller"
);

console.log("upload:", upload);
console.log("protect:", protect);
console.log("checkUsage:", checkUsage);
console.log("askAI:", askAI);

// AI request route
router.post(
  "/chat",
  upload.single("file"),
  protect,
  checkUsage(
    "AI",
    "aiRequestsToday",
    "aiRequestsPerDay"
  ),
  askAI
);

module.exports =
  router;