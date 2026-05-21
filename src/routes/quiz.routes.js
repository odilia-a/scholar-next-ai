const express =
  require(
    "express"
  );

const router =
  express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const quiz =
  require(
    "../controllers/quiz.controller"
);


router.post(
  "/generate",
  protect,
  quiz.createQuiz
);

router.post(
  "/predict",
  protect,
  quiz.examPredictor
);

router.post(
  "/submit",
  protect,
  quiz.submitQuiz
);

router.get(
  "/analytics",
  protect,
  quiz.getAnalytics
);


module.exports =
  router;