const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedOption: String,
        correct: Boolean,
      },
    ],
    score: {
      type: Number, // percentage
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ user: 1, quiz: 1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);