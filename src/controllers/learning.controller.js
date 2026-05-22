const LearningProfile =
  require(
    "../models/learningProfile"
  );

const {
  generateDailyPlan,
} = require(
  "../services/learning.service"
);


const sendToGemini =
  require(
    "../services/gemini.service"
  );

// TIMETABLE

const createTimetable = async (req, res, next) => {
  try {
    const { subjects } = req.body;

    const prompt = `
You are an academic planner AI.

Create a realistic weekly study timetable.

Rules:
- Include Monday to Sunday
- Each day max 4 study sessions
- Each session max 2 hours
- Balance hard and easy subjects
- Hard subjects must appear more frequently
- Include revision sessions after every 2 study days
- Sunday must be revision + light study only
- Avoid overloading any single day
- Ensure rest time is included

OUTPUT FORMAT:
Return ONLY valid JSON in this structure:

{
  "Monday": [
    {
      "time": "Morning",
      "subject": "",
      "duration": "2h"
    }
  ]
}

SUBJECTS:
${subjects.join(", ")}
`;

    const result = await sendToGemini(prompt);

    const profile =
      await LearningProfile.findOneAndUpdate(
        {
          user: req.user._id,
        },
        {
          timetable: JSON.parse(result),
        },
        {
          upsert: true,
          new: true,
        }
      );

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};


// DAILY PLANNER

const createDailyPlan =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        tasks,
      } =
        req.body;

      const result =
        await generateDailyPlan(
          tasks
        );

      const profile =
        await LearningProfile.findOneAndUpdate(
          {
            user:
              req.user._id,
          },

          {
            dailyTasks:
              JSON.parse(
                result
              ),
          },

          {
            upsert:
              true,

            new:
              true,
          }
        );

      res.json({
        success:
          true,

        data:
          profile,
      });

    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

// WEAK SUBJECTS

const getWeakSubjects =
  async (
    req,
    res,
    next
  ) => {

    try {

      const profile =
        await LearningProfile.findOne({
          user:
            req.user._id,
        });

      const weak =
        profile.subjects.filter(
          (
            subject
          ) =>
            subject.score < 50
        );

      res.json({
        success:
          true,

        data:
          weak,
      });

    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

// DASHBOARD

const getDashboard = async (req, res, next) => {
  try {
    const profile = await LearningProfile.findOne({
      user: req.user._id,
    });

    const totalSubjects = profile.subjects.length;

    const weakSubjects = profile.subjects.filter(
      (s) => s.score < 50
    );

    const averageScore =
      totalSubjects
        ? profile.subjects.reduce(
            (sum, s) => sum + s.score,
            0
          ) / totalSubjects
        : 0;

    const completedTasks = profile.dailyTasks.filter(
      (t) => t.completed
    ).length;

    const completionRate =
      profile.dailyTasks.length
        ? (completedTasks /
            profile.dailyTasks.length) *
          100
        : 0;

    return res.json({
      success: true,
      data: {
        totalSubjects,
        weakSubjects: weakSubjects.length,
        averageScore: Math.round(averageScore),
        completionRate: Math.round(completionRate),
        insights: [
          weakSubjects.length > 0
            ? "Focus on weak subjects"
            : "Good performance overall",
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

  module.exports = {
  createTimetable,
  createDailyPlan,
  getWeakSubjects,
  getDashboard,
};