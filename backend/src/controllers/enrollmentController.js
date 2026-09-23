const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// @route  POST /api/courses/:id/enroll
// Student only (any logged-in user)
exports.enrollInCourse = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to enroll in this course. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/enrollments/me
exports.getMyEnrollments = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load your courses. Please try again.",
      data: null,
    });
  }
};