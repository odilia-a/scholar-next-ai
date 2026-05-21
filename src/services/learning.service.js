const sendToGemini =
  require(
    "./gemini.service"
  );


// GENERATE TIMETABLE

const generateTimetable =
  async (
    subjects
  ) => {

    const prompt =
      `
Create a weekly study timetable for:

${subjects.join(", ")}

Return JSON only.
`;

    return await sendToGemini(
      prompt
    );
  };


// DAILY PLANNER

const generateDailyPlan =
  async (
    tasks
  ) => {

    const prompt =
      `
Organize these study tasks:

${tasks.join(", ")}

Return JSON only.
`;

    return await sendToGemini(
      prompt
    );
  };


module.exports = {
  generateTimetable,
  generateDailyPlan,
};