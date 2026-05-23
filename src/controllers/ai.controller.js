const routePrompt = require("../services/aiRouter.service");
const { trackCost } = require("../services/costControl.service");

const askAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    const result = await routePrompt({
      prompt: req.body.prompt,
      file: req.file,
      userId: req.user?._id,
    });

    // Track cost if API call was successful and we have token info
    if (result.success && result.provider) {
      try {
        await trackCost(req.user._id, result.provider, {
          inputTokens: result.inputTokens || 0,
          outputTokens: result.outputTokens || 0,
        });
      } catch (err) {
        console.error("Error tracking cost:", err);
        // Don't fail the request if cost tracking fails
      }
    }

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