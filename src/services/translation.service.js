const sendToGemini = require("./gemini.service");

// Translate ANY language → English
const translateToEnglish = async (text, sourceLang) => {
  if (sourceLang === "english") return text;

  const prompt = `
Translate the following text from ${sourceLang} to English.

Text:
${text}

Return ONLY translated text.
`;

  return await sendToGemini(prompt);
};

// Translate English → target language
const translateFromEnglish = async (text, targetLang) => {
  if (targetLang === "english") return text;

  const prompt = `
Translate the following English text into ${targetLang}.

Text:
${text}

Return ONLY translated text.
`;

  return await sendToGemini(prompt);
};

module.exports = {
  translateToEnglish,
  translateFromEnglish,
};