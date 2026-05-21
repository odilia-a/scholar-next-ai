const mongoose =
  require("mongoose");

const learningSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema
            .Types
            .ObjectId,

        ref:
          "User",

        required:
          true,
      },

      subjects: [
        {
          name:
            String,

          score:
            Number,
        },
      ],

      timetable: [
        {
          day:
            String,

          subject:
            String,

          duration:
            Number,
        },
      ],

      dailyTasks: [
        {
          title:
            String,

          completed: {
            type:
              Boolean,

            default:
              false,
          },
        },
      ],
    },

    {
      timestamps:
        true,
    }
  );

module.exports =
  mongoose.model(
    "LearningProfile",
    learningSchema
  );