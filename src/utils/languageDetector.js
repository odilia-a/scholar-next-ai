const franc = require("franc");

// Simple language map
const langMap = {
  eng: "english",
  fra: "french",
  spa: "spanish",
  deu: "german",
  por: "portuguese",
  hin: "hindi",
  ara: "arabic",
  yor: "yoruba",
  swa: "swahili",
};

const detectLanguage = (text) => {
  const code = franc(text);

  return langMap[code] || "english";
};

module.exports = detectLanguage;