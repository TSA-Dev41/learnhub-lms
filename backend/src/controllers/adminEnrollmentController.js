const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/admin/enrollments
exports.getAllEnrollments = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.courseId) {
    filter.course = req.query.courseId;
  }

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("student", "name email")
      .populate("course", "title"),
    Enrollment.countDocuments(filter),
  ]);

  const data = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId = enrollment.course?._id;
      const studentId = enrollment.student?._id;

      const totalLessons = courseId
        ? await Lesson.countDocuments({ course: courseId, published: true })
        : 0;
      const completedLessons =
        courseId && studentId
          ? await LessonProgress.countDocuments({ user: studentId, course: courseId })
          : 0;

      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: enrollment._id,
        studentName: enrollment.student?.name || "Unknown student",
        studentEmail: enrollment.student?.email || "",
        courseId,
        courseTitle: enrollment.course?.title || "Deleted course",
        enrolledAt: enrollment.createdAt,
        status: enrollment.status,
        progressPercent,
      };
    })
  );

  res.status(200).json({
    success: true,
    message: "Enrollments retrieved successfully",
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});
