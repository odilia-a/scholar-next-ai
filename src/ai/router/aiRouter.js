const classifyPrompt =
  require("./keywordClassifier");

const grokService =
  require("../providers/grok.service");

const geminiService =
  require("../providers/gemini.service");

const hfService =
  require("../providers/huggingface.service");

const routeAI = async (prompt) => {
  try {

    let provider =
      classifyPrompt(prompt);

    let response;

    switch (provider) {

      case "grok":
        response =
          await grokService(prompt);
        break;

      case "gemini":
        response =
          await geminiService(prompt);
        break;

      case "huggingface":
        response =
          await hfService(prompt);
        break;

      // GENERAL FALLBACK
      default:
        provider = "fallback";

        response =
          await geminiService(prompt);
    }

    return {
      provider,
      response,
    };

  } catch (error) {

    console.error(
      "AI Router Error:",
      error.message
    );

    return {
      provider: "error",

      response:
        "AI service temporarily unavailable.",
    };
  }
};

module.exports = routeAI;