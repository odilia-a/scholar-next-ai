const Paystack = require(
  "paystack"
);

const paystack =
  Paystack(
    process.env
      .PAYSTACK_SECRET_KEY
  );

const subscriptionPlans =
  require(
    "../config/subscriptionPlans"
  );

const createPaystackCheckout =
  async (
    user,
    planName
  ) => {
    const plan =
      subscriptionPlans[
        planName
      ];

    const response =
      await paystack
        .transaction
        .initialize({
          email:
            user.email,

          amount:
            plan.price
              .ngn * 100,

          metadata:
            {
              userId:
                user._id.toString(),

              plan:
                planName,
            },

          callback_url:
            `${process.env.CLIENT_URL}/payment-success`,
        });

    return response;
  };

module.exports = {
  createPaystackCheckout,
};