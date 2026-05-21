const sendToGemini =
  require(
    "./gemini.service"
  );

// GENERATE QUIZ

const generateQuiz =
  async (
    topic
  ) => {

    const prompt =
      `
Generate 5 academic quiz questions about:

${topic}

Return JSON only:
[
 {
   "question":"",
   "correctAnswer":""
 }
]
`;

    return await sendToGemini(
      prompt
    );
  };


// EXAM PREDICTOR

const predictExam =
  async (
    topic
  ) => {

    const prompt =
      `
Predict likely university exam questions for:

${topic}

Return 5 questions only.
`;

    return await sendToGemini(
      prompt
    );
  };


module.exports = {
  generateQuiz,
  predictExam,
};