const grokKeywords = [
  "solve",
  "equation",
  "integral",
  "derivative",
  "physics",
  "calculate",
  "math",
  "engineering",
  "beam",
  "stress",
  "strain",
  "design",
  "statistics",
  "formula",
  "thermodynamics",
];

const geminiKeywords = [
  "essay",
  "write",
  "story",
  "paragraph",
  "grammar",
  "rewrite",
  "literature",
  "citation",
  "assignment",
  "plagiarism",
  "email",
];

const hfKeywords = [
  "pdf",
  "document",
  "summarize",
  "notes",
  "file",
  "lecture note",
  "textbook",
  "extract",
  "upload",
];

const containsKeyword = (
  text,
  keywords
) => {
  return keywords.some((word) =>
    text.includes(word)
  );
};

const classifyPrompt = (prompt) => {

  const text =
    prompt.toLowerCase();

  // DOCUMENTS
  if (
    containsKeyword(
      text,
      hfKeywords
    )
  ) {
    return "huggingface";
  }

  // STEM
  if (
    containsKeyword(
      text,
      grokKeywords
    )
  ) {
    return "grok";
  }

  // WRITING
  if (
    containsKeyword(
      text,
      geminiKeywords
    )
  ) {
    return "gemini";
  }

  // DEFAULT
  return "fallback";
};

module.exports =
  classifyPrompt;