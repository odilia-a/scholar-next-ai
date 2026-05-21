const Flutterwave =
  require(
    "flutterwave-node-v3"
  );

const subscriptionPlans =
  require(
    "../config/subscriptionPlans"
  );

const flw =
  new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );

const createFlutterwavePayment =
  async (
    user,
    planName
  ) => {
    const plan =
      subscriptionPlans[
        planName
      ];

    const payload = {
      tx_ref: `scholar-${Date.now()}`,

      amount:
        plan.price.ngn,

      currency:
        "NGN",

      redirect_url:
        `${process.env.CLIENT_URL}/payment-success`,

      customer: {
        email:
          user.email,
      },

      customizations:
        {
          title:
            `Scholar Next ${plan.name}`,
        },

      meta: {
        userId:
          user._id.toString(),

        plan:
          planName,
      },
    };

    const response =
      await flw.Charge.card(
        payload
      );

    return response;
  };

module.exports = {
  createFlutterwavePayment,
};