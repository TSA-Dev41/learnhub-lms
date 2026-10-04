const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const ContactMessage = require("../models/ContactMessage");
const QuizAttempt = require("../models/QuizAttempt");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [
    publishedCourses,
    draftCourses,
    archivedCourses,
    students,
    enrollments,
    unreadMessages,
    quizAttempts,
    recentEnrollments,
  ] = await Promise.all([
    Course.countDocuments({ status: "published" }),
    Course.countDocuments({ status: "draft" }),
    Course.countDocuments({ status: "archived" }),
    User.countDocuments({ role: "student" }),
    Enrollment.countDocuments(),
    ContactMessage.countDocuments({ read: false }),
    QuizAttempt.countDocuments(),
    Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student", "name")
      .populate("course", "title"),
  ]);

  res.status(200).json({
    success: true,
    message: "Stats retrieved",
    data: {
      publishedCourses,
      draftCourses,
      archivedCourses,
      students,
      enrollments,
      unreadMessages,
      quizAttempts,
      recentEnrollments: recentEnrollments.map((item) => ({
        enrollmentId: item._id,
        studentName: item.student?.name || "Unknown student",
        courseTitle: item.course?.title || "Deleted course",
        enrolledAt: item.createdAt,
      })),
    },
  });
});
