const routePrompt = require("../services/aiRouter.service");

const askAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    const result = await routePrompt({
      prompt: req.body.prompt,
      file: req.file,
      userId: req.user?._id,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askAI,
};