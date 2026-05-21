const formatResponse = (provider, response, language) => {
  return {
    success: true,
    provider,
    language,
    timestamp: new Date().toISOString(),

    data: {
      answer: response,
      confidence: provider === "fallback" ? 0.5 : 0.95,
      model: provider
    },
  };
};

module.exports = formatResponse;