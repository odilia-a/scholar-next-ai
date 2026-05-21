const aiProtect = (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  if (prompt.length > 5000) {
    return res.status(413).json({
      success: false,
      message: "Prompt too long",
    });
  }

  next();
};

module.exports = aiProtect;