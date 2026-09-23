const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("LessonProgress", lessonProgressSchema);