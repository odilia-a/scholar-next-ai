const express =
  require(
    "express"
  );

const router =
  express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const learning =
  require(
    "../controllers/learning.controller"
);


router.post(
  "/timetable",
  protect,
  learning.createTimetable
);

router.post(
  "/daily-plan",
  protect,
  learning.createDailyPlan
);

router.get(
  "/weak-subjects",
  protect,
  learning.getWeakSubjects
);

router.get(
  "/dashboard",
  protect,
  learning.getDashboard
);


module.exports =
  router;