const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/courses/:id/enroll
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);
  if (!course || course.status !== "published") {
    return res.status(404).json({
      success: false,
      message: "Course not found",
      data: null,
    });
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "You are already enrolled in this course",
      data: null,
    });
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId,
  });

  res.status(201).json({
    success: true,
    message: "Enrolled successfully",
    data: {
      enrollmentId: enrollment._id,
      courseId: course._id,
    },
  });
});

// @route  GET /api/enrollments/me
exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate(
    "course",
    "title thumbnail category level status"
  );

  const data = await Promise.all(
    enrollments.map(async (e) => {
      const courseId = e.course?._id;
      const totalLessons = courseId
        ? await Lesson.countDocuments({ course: courseId, published: true })
        : 0;
      const completedLessons = courseId
        ? await LessonProgress.countDocuments({
            user: req.user._id,
            course: courseId,
          })
        : 0;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: e._id,
        courseId,
        title: e.course?.title || "Course unavailable",
        thumbnail: e.course?.thumbnail || "",
        category: e.course?.category || "",
        level: e.course?.level || "",
        status: e.status,
        enrolledAt: e.createdAt,
        completedLessons,
        totalLessons,
        progressPercent,
      };
    })
  );

  res.status(200).json({
    success: true,
    message: "Enrollments retrieved successfully",
    data,
  });
});
