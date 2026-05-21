const sendToGemini = async (prompt) => {
  try {
    console.log("✍️ Routing to Gemini");

    return {
      provider: "gemini",
      response: `Gemini handled: ${prompt}`,
    };
  } catch (error) {
    throw new Error("Gemini service failed");
  }
};

module.exports = sendToGemini;