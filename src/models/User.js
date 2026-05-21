const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    language: {
      type: String,
      default: "en",
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },

    usage: {
  aiRequestsToday: {
    type: Number,
    default: 0,
  },

  pdfUploadsThisWeek: {
    type: Number,
    default: 0,
  },

  quizzesToday: {
    type: Number,
    default: 0,
  },

  translationsToday: {
    type: Number,
    default: 0,
  },
},
subscriptionPlan: {
  type: String,

  enum: [
    "free",
    "gold",
    "diamond",
  ],

  default: "free",
},

    weakSubjects: [String],

    streak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);