const createPayPalPayment =
  async (
    user,
    planName
  ) => {
    return {
      provider:
        "paypal",

      message:
        "PayPal checkout created",
    };
  };

module.exports = {
  createPayPalPayment,
};