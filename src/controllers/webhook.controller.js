const crypto = require("crypto");
const WebhookEvent = require("../models/webhookEvent");
const upgradeSubscription = require("../utils/upgradeSubscription");

 //HELPERS (IDEMPOTENCY)
const isDuplicate = async (eventId) => {
  const exists = await WebhookEvent.findOne({ eventId });
  return !!exists;
};

const markProcessed = async (eventId, provider) => {
  await WebhookEvent.create({
    eventId,
    provider,
    processed: true,
  });
};

 //PAYSTACK WEBHOOK
const paystackWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;
    const eventId = event.id;

    if (await isDuplicate(eventId)) {
      return res.status(200).send("Already processed");
    }

    if (event.event === "charge.success") {
      const userId = event.data.metadata.userId;
      const plan = event.data.metadata.plan;

      await upgradeSubscription(userId, plan);

      console.log("✅ Paystack payment confirmed");
    }

    await markProcessed(eventId, "paystack");

    return res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
};

 //FLUTTERWAVE WEBHOOK
const flutterwaveWebhook = async (req, res, next) => {
  try {
    const payload = req.body;

    const flwSignature = req.headers["verif-hash"];

    if (flwSignature !== process.env.FLW_WEBHOOK_SECRET) {
      return res.status(401).send("Invalid signature");
    }

    const eventId = payload.id;

    if (await isDuplicate(eventId)) {
      return res.status(200).send("Already processed");
    }

    if (payload.status === "successful") {
      const userId = payload.meta.userId;
      const plan = payload.meta.plan;

      await upgradeSubscription(userId, plan);

      console.log("✅ Flutterwave payment confirmed");
    }

    await markProcessed(eventId, "flutterwave");

    return res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * PAYPAL WEBHOOK
 * ======================
 */
const paypalWebhook = async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload.event_type) {
      return res.status(400).send("Invalid PayPal webhook");
    }

    const eventId = payload.id;

    if (await isDuplicate(eventId)) {
      return res.status(200).send("Already processed");
    }

    if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const userId = payload.resource.custom_id;
      const plan = payload.resource.invoice_id;

      await upgradeSubscription(userId, plan);

      console.log("✅ PayPal payment confirmed");
    }

    await markProcessed(eventId, "paypal");

    return res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
};

/**
 * ======================
 * EXPORTS
 * ======================
 */
module.exports = {
  paystackWebhook,
  flutterwaveWebhook,
  paypalWebhook,
};