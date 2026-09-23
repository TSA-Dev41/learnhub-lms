const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");

// Use on lesson routes where :id is a LESSON id
exports.requireEnrollment = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
        data: null,
      });
    }

    // Admins can access any lesson
    if (req.user.role === "admin") {
      req.lesson = lesson;
      return next();
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course before accessing its lessons.",
        data: null,
      });
    }

    req.lesson = lesson;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to verify enrollment. Please try again.",
      data: null,
    });
  }
};