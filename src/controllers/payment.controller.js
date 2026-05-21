const User = require("../models/User");
const Payment = require("../models/Payment");
const { createPaystackCheckout } = require("../services/paystack.service");
const { createFlutterwavePayment } = require("../services/flutterwave.service");
const { createPayPalPayment } = require("../services/paypal.service");

//CREATE CHECKOUT
const createCheckout = async ( req, res, next ) => {
    try {
      const {
        plan,
        region,
      } = req.body;

      const user =
        req.user;

      let result;

      // Africa
      if (
        region ===
        "africa"
      ) {
        result =
          await createPaystackCheckout(
            user,
            plan
          );
      }

      // Global
      else if (
        region ===
        "global"
      ) {
        result =
          await createFlutterwavePayment(
            user,
            plan
          );
      }

      // Fallback
      else {
        result =
          await createPayPalPayment(
            user,
            plan
          );
      }

      res.status(
        200
      ).json({
        success:
          true,

        data:
          result,
      });
    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

// VERIFY PAYMENT
const verifyPayment = async (req, res, next) => {
  try {
    const { reference, provider } = req.body;

    let verified = false;
    let paymentData;

    // PAYSTACK VERIFY
    if (provider === "paystack") {
      const axios = require("axios");

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      paymentData = response.data.data;

      if (paymentData.status === "success") {
        verified = true;
      }
    }

    // FLUTTERWAVE VERIFY
    else if (provider === "flutterwave") {
      const axios = require("axios");

      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      paymentData = response.data.data;

      if (paymentData.status === "successful") {
        verified = true;
      }
    }

    // PAYPAL (SIMPLIFIED)
    else if (provider === "paypal") {
      verified = true;
      paymentData = { reference };
    }

    // SUCCESS FLOW
    if (verified) {
      const userId =
        paymentData?.metadata?.userId ||
        paymentData?.data?.metadata?.userId;

      const plan =
        paymentData?.metadata?.plan ||
        paymentData?.data?.metadata?.plan;

        // 🧾 1. SAVE PAYMENT FIRST (IMPORTANT)
  await Payment.create({
    user: userId,
    plan,
    amount: paymentData.amount
      ? paymentData.amount / 100
      : 0,
    currency: paymentData.currency || "NGN",
    provider,
    status: "successful",
    transactionId: reference,
  });

      // Update user subscription
      await User.findByIdAndUpdate(userId, {
        subscriptionPlan: plan,
      });

      return res.json({
        success: true,
        message:
          "Payment verified and subscription updated",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  } catch (error) {
    next(error);
  }
};

//GET PAYMENT HISTORY
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckout,
  verifyPayment,
  getPaymentHistory,
};