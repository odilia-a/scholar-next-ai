const axios = require("axios");

const huggingfaceService = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const result = response?.data?.[0]?.summary_text;

    if (!result) {
      throw new Error("No summary returned from HuggingFace");
    }

    return result;
  } catch (error) {
    console.error("HuggingFace Service Error:", error.message);

    return "Document service temporarily unavailable. Please try again.";
  }
};

module.exports = huggingfaceService;