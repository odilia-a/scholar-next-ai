const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const {
  getCostReports,
  getUserCostSummary,
  getSystemCostMetrics,
  setBudget,
  getTopSpenders,
} = require("../controllers/admin.controller");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can access this endpoint",
    });
  }
  next();
};

// Get cost reports for a user
router.get("/cost-reports/:userId", protect, isAdmin, getCostReports);

// Get user cost summary
router.get("/user-cost-summary/:userId", protect, isAdmin, getUserCostSummary);

// Get system-wide cost metrics
router.get("/system-cost-metrics", protect, isAdmin, getSystemCostMetrics);

// Set budget limit for a user
router.post("/set-budget/:userId", protect, isAdmin, setBudget);

// Get top spenders
router.get("/top-spenders", protect, isAdmin, getTopSpenders);

module.exports = router;
