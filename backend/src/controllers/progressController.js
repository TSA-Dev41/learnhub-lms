const LessonProgress = require("../models/LessonProgress");

// @route  POST /api/lessons/:id/complete
exports.markLessonComplete = async (req, res) => {
  try {
    const lesson = req.lesson;

    const existing = await LessonProgress.findOne({
      user: req.user._id,
      lesson: lesson._id,
    });

    if (!existing) {
      await LessonProgress.create({
        user: req.user._id,
        lesson: lesson._id,
        course: lesson.course,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lesson marked complete",
      data: { lessonId: lesson._id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to mark lesson complete. Please try again.",
      data: null,
    });
  }
};