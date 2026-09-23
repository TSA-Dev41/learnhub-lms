const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
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
    content: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number, // minutes
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);