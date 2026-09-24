const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Question text is required"],
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2,
        message: "A question needs at least 2 options",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
    },
    points: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

questionSchema.index({ quiz: 1 });

module.exports = mongoose.model("Question", questionSchema);