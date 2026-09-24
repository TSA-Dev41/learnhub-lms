const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    passingScore: {
      type: Number,
      default: 70, // percentage
    },
    timeLimit: {
      type: Number, // minutes, 0 = no limit
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

quizSchema.index({ course: 1 });

module.exports = mongoose.model("Quiz", quizSchema);