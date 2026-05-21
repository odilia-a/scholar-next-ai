const classifyPrompt = (prompt) => {

  const text =
    prompt.toLowerCase();

  // SHORT PROMPTS
  if (text.length < 5) {
    return "fallback";
  }

  let scores = {
    grok: 0,
    gemini: 0,
    huggingface: 0,
  };

  // MATH / ENGINEERING
  if (
    /solve|equation|integral|derivative|physics|calculate|thermodynamics/.test(text)
  ) {
    scores.grok += 2;
  }

  // WRITING
  if (
    /essay|write|rewrite|story|grammar|paragraph|literature/.test(text)
  ) {
    scores.gemini += 2;
  }

  // DOCUMENTS
  if (
    /pdf|document|summarize|notes|file|extract/.test(text)
  ) {
    scores.huggingface += 2;
  }

  // BEST MATCH
  const best =
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

  // FALLBACK
  if (best[1] === 0) {
    return "fallback";
  }

  return best[0];
};

module.exports =
  classifyPrompt;