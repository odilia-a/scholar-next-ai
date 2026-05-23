/**
 * Feature gates per subscription tier
 * Defines what features are available to each plan
 */
const featureGates = {
  free: {
    chat: { 
      enabled: true, 
      dailyLimit: 20,
      description: "Basic AI chat assistance" 
    },
    pdfUpload: { 
      enabled: false,
      description: "PDF document analysis" 
    },
    advancedAnalysis: { 
      enabled: false,
      description: "In-depth analysis and insights" 
    },
    customQuizzes: { 
      enabled: true, 
      dailyLimit: 5,
      description: "Create custom quizzes" 
    },
    translation: { 
      enabled: true, 
      dailyLimit: 10,
      description: "Translate content" 
    },
    exportResults: { 
      enabled: false,
      description: "Export quiz and analysis results" 
    },
    apiAccess: { 
      enabled: false,
      description: "API access for integrations" 
    },
    prioritySupport: { 
      enabled: false,
      description: "Priority customer support" 
    },
  },

  gold: {
    chat: { 
      enabled: true, 
      dailyLimit: 300,
      description: "Unlimited AI chat assistance" 
    },
    pdfUpload: { 
      enabled: true, 
      weeklyLimit: 30,
      description: "Upload and analyze PDF documents" 
    },
    advancedAnalysis: { 
      enabled: true,
      description: "In-depth analysis and insights" 
    },
    customQuizzes: { 
      enabled: true, 
      dailyLimit: 50,
      description: "Create custom quizzes" 
    },
    translation: { 
      enabled: true, 
      dailyLimit: 100,
      description: "Translate content" 
    },
    exportResults: { 
      enabled: true,
      description: "Export quiz and analysis results" 
    },
    apiAccess: { 
      enabled: false,
      description: "API access for integrations" 
    },
    prioritySupport: { 
      enabled: true,
      description: "Priority email support" 
    },
  },

  diamond: {
    chat: { 
      enabled: true, 
      dailyLimit: -1,
      description: "Unlimited AI chat assistance" 
    },
    pdfUpload: { 
      enabled: true, 
      weeklyLimit: -1,
      description: "Unlimited PDF uploads" 
    },
    advancedAnalysis: { 
      enabled: true,
      description: "Advanced analysis with custom parameters" 
    },
    customQuizzes: { 
      enabled: true, 
      dailyLimit: -1,
      description: "Unlimited quiz creation" 
    },
    translation: { 
      enabled: true, 
      dailyLimit: -1,
      description: "Unlimited translations" 
    },
    exportResults: { 
      enabled: true,
      description: "Export in multiple formats" 
    },
    apiAccess: { 
      enabled: true,
      description: "Full API access" 
    },
    prioritySupport: { 
      enabled: true,
      description: "24/7 priority support + dedicated account manager" 
    },
  },
};

module.exports = featureGates;
