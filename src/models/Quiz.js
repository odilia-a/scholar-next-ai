const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
       required: true,
    },
    title: {
        type: String,
        required: true,
    },
    topic: {
        type:
          String,

        required:
          true,
      },

    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String,
        userAnswer: String,
        isCorrect: Boolean,
      },
    ],

    score: {
      type: Number,
      default: 0,
    },
     percentage: {
        type:
          Number,

        default:
          0,
      },
      subject: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);