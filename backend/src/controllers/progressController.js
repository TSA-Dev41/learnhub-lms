const LessonProgress = require("../models/LessonProgress");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/lessons/:id/complete
exports.markLessonComplete = asyncHandler(async (req, res) => {
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

  const totalLessons = await Lesson.countDocuments({
    course: lesson.course,
    published: true,
  });
  const completedLessons = await LessonProgress.countDocuments({
    user: req.user._id,
    course: lesson.course,
  });

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  res.status(200).json({
    success: true,
    message: "Lesson marked complete",
    data: { lessonId: lesson._id, courseProgressPercent: progressPercent },
  });
});

// @route  GET /api/progress
// Progress across all enrolled courses
exports.getMyProgress = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate(
    "course",
    "title"
  );

  const data = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.course._id;

      const totalLessons = await Lesson.countDocuments({
        course: courseId,
        published: true,
      });
      const completedLessons = await LessonProgress.countDocuments({
        user: req.user._id,
        course: courseId,
      });

      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        courseId,
        title: enrollment.course.title,
        completedLessons,
        totalLessons,
        progressPercent,
      };
    })
  );

  res.status(200).json({
    success: true,
    message: "Progress retrieved successfully",
    data,
  });
});

// @route  GET /api/progress/:courseId
// Detailed progress for one course, including quiz results
exports.getCourseProgress = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (!enrollment && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You must enroll in this course to view its progress.",
      data: null,
    });
  }

  const totalLessons = await Lesson.countDocuments({
    course: courseId,
    published: true,
  });
  const completedLessons = await LessonProgress.countDocuments({
    user: req.user._id,
    course: courseId,
  });
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const quizzes = await Quiz.find({ course: courseId, status: "published" });
  const quizResults = await Promise.all(
    quizzes.map(async (quiz) => {
      const attempt = await QuizAttempt.findOne({
        user: req.user._id,
        quiz: quiz._id,
      }).sort({ createdAt: -1 });

      return {
        quizId: quiz._id,
        title: quiz.title,
        score: attempt ? attempt.score : null,
        passed: attempt ? attempt.passed : null,
        attempted: !!attempt,
      };
    })
  );

  res.status(200).json({
    success: true,
    message: "Course progress retrieved successfully",
    data: {
      courseId,
      completedLessons,
      totalLessons,
      progressPercent,
      quizResults,
    },
  });
});