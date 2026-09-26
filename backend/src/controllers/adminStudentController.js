const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt = require("../models/QuizAttempt");

// @route  GET /api/admin/students
// List all students (role: student)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name email createdAt"
    );

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load students. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/admin/students/:id
// Single student's basic info
exports.getStudentById = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load student. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/admin/students/:id/enrollments
// A student's enrollments, with course title
exports.getStudentEnrollments = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load enrollments. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/admin/students/:id/progress
// A student's lesson completions + quiz attempts, grouped loosely by course
exports.getStudentProgress = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load progress. Please try again.",
      data: null,
    });
  }
};