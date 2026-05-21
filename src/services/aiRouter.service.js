const sendToGrok = require("./grok.service");
const sendToGemini = require("./gemini.service");
const sendToHuggingFace = require("./huggingface.service");
const trackUsage = require("../ai/usage/trackUsage.service");
const detectLanguage = require("../utils/languageDetector");
const {
  translateToEnglish,
  translateFromEnglish,
} = require("../services/translation.service");
/**
 * Scholar Next AI Router
 */

const mathKeywords = [
  "solve",
  "equation",
  "calculate",
  "integrate",
  "derivative",
  "formula",
  "matrix",
  "statistics",
];

const engineeringKeywords = [
  "beam",
  "stress",
  "strain",
  "cad",
  "soil",
  "concrete",
  "fluid",
  "design",
  "thermodynamics",
];

const writingKeywords = [
  "essay",
  "rewrite",
  "grammar",
  "paraphrase",
  "literature",
  "summary",
  "citation",
];

const documentKeywords = [
  "pdf",
  "document",
  "lecture note",
  "textbook",
  "extract",
  "file",
  "upload",
];

//Keyword matcher
const containsKeyword = (prompt, keywords) => {
  return keywords.some((word) =>
    prompt.toLowerCase().includes(word.toLowerCase())
  );
};

//Main router
const routePrompt = async ({ prompt, file, userId }) => {
  try {
    let response;
    let provider;

    //Detect language
    const userLanguage = detectLanguage(prompt);

    //Translate to English
    const englishPrompt = await translateToEnglish(
      prompt,
      userLanguage
    );

    // PDF/document route
    if (file || containsKeyword(prompt, documentKeywords)) {
      provider = "huggingface";
      response = await sendToHuggingFace({ prompt, file });
    }

    // Math + Engineering route
    else if (
      containsKeyword(prompt, mathKeywords) ||
      containsKeyword(prompt, engineeringKeywords)
    ) {
      provider = "grok";
      response = await sendToGrok(prompt);
    }

    // Writing route
    else if (containsKeyword(prompt, writingKeywords)) {
      provider = "gemini";
      response = await sendToGemini(prompt);
    }

    // GENERAL CHAT FALLBACK
    else {
      provider = "gemini";
      response = await sendToGemini(prompt);
    }

    // TRACK USAGE
    if (userId) {
      await trackUsage(userId, provider);
    }

    //Translate back to user language
    const finalResponse = await translateFromEnglish(
      response,
      userLanguage
    );

    //RETURN FINAL STRUCTURE
    return {
      success: true,
      provider,
      language: userLanguage,
      response: finalResponse,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = routePrompt;