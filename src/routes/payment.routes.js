const express = require("express");
const router = express.Router();

const protect  = require("../middleware/auth.middleware");

const {
  createCheckout,
  verifyPayment,
  getPaymentHistory,
} = require("../controllers/payment.controller");

// 👇 ADD IT HERE (DEBUG LINE)
console.log({
  createCheckout,
  verifyPayment,
  getPaymentHistory,
});

router.post("/checkout", protect, createCheckout);

router.post("/verify", protect, verifyPayment);

router.get("/history", protect, getPaymentHistory);

module.exports = router;