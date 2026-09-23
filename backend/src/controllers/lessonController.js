const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress"); // built in Phase 4 — safe to reference now, file just needs to exist by then

// @route  GET /api/courses/:id/lessons
// Public — titles/order only if not enrolled, full list either way (no content shown here)
exports.getLessonsForCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id, published: true }).sort({
      order: 1,
    });

    let enrolledCourseIds = [];
    if (req.user) {
      const enrollments = await Enrollment.find({ student: req.user._id }).select("course");
      enrolledCourseIds = enrollments.map((e) => e.course.toString());
    }

    const hasAccess =
      req.user &&
      (req.user.role === "admin" || enrolledCourseIds.includes(req.params.id));

    const data = lessons.map((l) => ({
      id: l._id,
      title: l.title,
      order: l.order,
      duration: l.duration,
      hasAccess: !!hasAccess,
    }));

    res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load lessons. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/lessons/:id
// Requires enrollment (via requireEnrollment middleware, sets req.lesson)
exports.getLessonById = async (req, res) => {
  try {
    const lesson = req.lesson;

    let completed = false;
    if (LessonProgress) {
      const progress = await LessonProgress.findOne({
        user: req.user._id,
        lesson: lesson._id,
      });
      completed = !!progress;
    }

    res.status(200).json({
      success: true,
      message: "Lesson retrieved successfully",
      data: {
        id: lesson._id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        order: lesson.order,
        duration: lesson.duration,
        completed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load this lesson. Please try again.",
      data: null,
    });
  }
};

// @route  POST /api/admin/lessons
// Admin only
exports.createLesson = async (req, res) => {
  try {
    const { course, title, description, content, videoUrl, order, duration, published } =
      req.body;

    if (!course || !title) {
      return res.status(400).json({
        success: false,
        message: "Course and title are required",
        data: null,
      });
    }

    const lesson = await Lesson.create({
      course,
      title,
      description,
      content,
      videoUrl,
      order,
      duration,
      published,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create lesson. Please try again.",
      data: null,
    });
  }
};

// @route  PUT /api/admin/lessons/:id
// Admin only
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update lesson. Please try again.",
      data: null,
    });
  }
};

// @route  DELETE /api/admin/lessons/:id
// Admin only
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lesson deleted",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete lesson. Please try again.",
      data: null,
    });
  }
};