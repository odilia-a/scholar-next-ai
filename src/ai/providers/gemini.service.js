const axios = require("axios");

const geminiService = async (prompt) => {
  try {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }
  );

  const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  return text;
} catch (error) {
  console.error("Gemini service error:", error.message);
  return "AI service temporarily unavailable. Please try again later.";
}
};

module.exports = geminiService;