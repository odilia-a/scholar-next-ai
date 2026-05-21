const express =
  require(
    "express"
  );

const router =
  express.Router();

const {
  paystackWebhook,
  flutterwaveWebhook,
  paypalWebhook,
} = require(
  "../controllers/webhook.controller"
);


// Paystack
router.post(
  "/paystack",
  paystackWebhook
);

// Flutterwave
router.post(
  "/flutterwave",
  flutterwaveWebhook
);

// PayPal
router.post(
  "/paypal",
  paypalWebhook
);

module.exports =
  router;