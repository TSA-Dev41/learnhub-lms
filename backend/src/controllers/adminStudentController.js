const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt = require("../models/QuizAttempt");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/admin/students
// List all students (role: student)
exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" }).select(
    "name email createdAt"
  );

  res.status(200).json({
    success: true,
    message: "Students retrieved successfully",
    data: students,
  });
});

// @route  GET /api/admin/students/:id
// Single student's basic info
exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await User.findOne({
    _id: req.params.id,
    role: "student",
  }).select("name email createdAt");

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Student retrieved successfully",
    data: student,
  });
});

// @route  GET /api/admin/students/:id/enrollments
// A student's enrollments, with course title
exports.getStudentEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.params.id }).populate(
    "course",
    "title category level status"
  );

  const data = enrollments.map((e) => ({
    enrollmentId: e._id,
    courseId: e.course?._id,
    courseTitle: e.course?.title || "(deleted course)",
    status: e.status,
    enrolledAt: e.createdAt,
  }));

  res.status(200).json({
    success: true,
    message: "Enrollments retrieved successfully",
    data,
  });
});

// @route  GET /api/admin/students/:id/progress
// A student's lesson completions + quiz attempts, grouped loosely by course
exports.getStudentProgress = asyncHandler(async (req, res) => {
  const lessonProgress = await LessonProgress.find({ user: req.params.id })
    .populate("lesson", "title")
    .populate("course", "title");

  const quizAttempts = await QuizAttempt.find({ user: req.params.id })
    .populate("quiz", "title course")
    .sort({ createdAt: -1 });

  const lessons = lessonProgress.map((lp) => ({
    lessonId: lp.lesson?._id,
    lessonTitle: lp.lesson?.title || "(deleted lesson)",
    courseTitle: lp.course?.title || "(unknown course)",
    completedAt: lp.completedAt,
  }));

  const quizzes = quizAttempts.map((qa) => ({
    quizId: qa.quiz?._id,
    quizTitle: qa.quiz?.title || "(deleted quiz)",
    score: qa.score,
    passed: qa.passed,
    attemptedAt: qa.createdAt,
  }));

  res.status(200).json({
    success: true,
    message: "Progress retrieved successfully",
    data: { lessons, quizzes },
  });
});