const subscriptionPlans = {
  free: {
    name: "Free",

    price: {
      usd: 0,
      ngn: 0,
    },

    billingCycle: "monthly",

    limits: {
      aiRequestsPerDay: 20,
      pdfUploadsPerWeek: 2,
      quizzesPerDay: 5,
      translationsPerDay: 10,
    },
  },

  gold: {
    name: "Gold",

    price: {
      usd: 8,
      ngn: 3000,
    },

    billingCycle: "monthly",

    limits: {
      aiRequestsPerDay: 300,
      pdfUploadsPerWeek: 30,
      quizzesPerDay: 50,
      translationsPerDay: 100,
    },
  },

  diamond: {
    name: "Diamond",

    price: {
      usd: 15,
      ngn: 10000,
    },

    billingCycle: "monthly",

    limits: {
      aiRequestsPerDay: -1,
      pdfUploadsPerWeek: -1,
      quizzesPerDay: -1,
      translationsPerDay: -1,
    },
  },
};

module.exports = subscriptionPlans;