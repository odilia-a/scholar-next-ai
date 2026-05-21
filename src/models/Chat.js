const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "ai"],
        },
        content: String,
       provider: {
          type: String,
          enum: ["grok", "gemini", "huggingface"],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);