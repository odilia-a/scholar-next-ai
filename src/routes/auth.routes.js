const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");

const protect = require("../middleware/auth.middleware");

// Register
router.post(
  "/register",
  auth.register
);

// Login
router.post(
  "/login",
  auth.login
);

// PROTECTED ROUTES
router.get(
  "/me",
  protect,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);
module.exports = router;