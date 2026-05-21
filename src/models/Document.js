const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: String,

    fileUrl: String,

    fileType: {
      type: String,
      enum: ["pdf", "docx", "image", "txt"],
    },

    extractedText: String,

     summary: String,

    keyPoints: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);