const axios = require("axios");

const sendToGrok = async (prompt) => {
  try {
    console.log("🧠 Routing to Grok");

    // Placeholder until API keys added
    return {
      provider: "grok",
      response: `Grok handled: ${prompt}`,
    };

    /*
    Future real API call:

    const response = await axios.post(...)

    return response.data;
    */
  } catch (error) {
    throw new Error("Grok service failed");
  }
};

module.exports = sendToGrok;