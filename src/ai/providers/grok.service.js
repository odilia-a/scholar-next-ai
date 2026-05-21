const axios = require("axios");

const grokService = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-1",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response?.data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from Grok");
    }

    return text;
  } catch (error) {
    console.error("Grok Service Error:", error.message);

    return "AI service temporarily unavailable. Please try again.";
  }
};

module.exports = grokService;