const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/courses/:id/enroll
// Student only (any logged-in user)
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

  const data = enrollments.map((e) => ({
    enrollmentId: e._id,
    courseId: e.course._id,
    title: e.course.title,
    thumbnail: e.course.thumbnail,
    status: e.status,
    enrolledAt: e.createdAt,
  }));

  res.status(200).json({
    success: true,
    message: "Enrollments retrieved successfully",
    data,
  });
});