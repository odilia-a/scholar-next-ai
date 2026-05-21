const Quiz =
  require(
    "../models/Quiz"
  );

const {
  generateQuiz,
  predictExam,
} = require(
  "../services/quiz.service"
);


// GENERATE QUIZ

const createQuiz =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        topic,
      } =
        req.body;

      const questions =
        await generateQuiz(
          topic
        );

      const quiz =
        await Quiz.create({
          user:
            req.user._id,

          topic,

          questions:
            JSON.parse(
              questions
            ),
        });

      res.json({
        success:
          true,

        data:
          quiz,
      });

    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

// EXAM PREDICTOR

const examPredictor =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        topic,
      } =
        req.body;

      const result =
        await predictExam(
          topic
        );

      res.json({
        success:
          true,

        data:
          result,
      });

    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

// SUBMIT QUIZ

const submitQuiz =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        quizId,
        answers,
      } =
        req.body;

      const quiz =
        await Quiz.findById(
          quizId
        );

      let score =
        0;


      quiz.questions.forEach(
        (
          q,
          index
        ) => {

          q.userAnswer =
            answers[
              index
            ];

          q.isCorrect =
            (
              answers[
                index
              ]
              .toLowerCase() ===

              q.correctAnswer
                .toLowerCase()
            );

          if (
            q.isCorrect
          ) {
            score++;
          }
        }
      );


      quiz.score =
        score;

      quiz.percentage =
        (
          score /
          quiz.questions
            .length
        ) * 100;


      await quiz.save();


      res.json({
        success:
          true,

        data:
          quiz,
      });

    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

// ANALYTICS

const getAnalytics =
  async (
    req,
    res,
    next
  ) => {

    try {

      const quizzes =
        await Quiz.find({
          user:
            req.user._id,
        });


      const total =
        quizzes.length;


      const average =
        total
          ? quizzes.reduce(
              (
                sum,
                quiz
              ) =>
                sum +
                quiz.percentage,

              0
            ) / total
          : 0;


      res.json({
        success:
          true,

        data: {
          totalQuizzes:
            total,

          averageScore:
            average,
        },
      });

    } catch (
      error
    ) {
      next(
        error
      );
    }
  };

module.exports = {
  createQuiz,
  examPredictor,
  submitQuiz,
  getAnalytics,
};