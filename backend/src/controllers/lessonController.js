const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/courses/:id/lessons
// Public — titles/order only if not enrolled, full list either way (no content shown here)
exports.getLessonsForCourse = asyncHandler(async (req, res) => {
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
});

// @route  GET /api/admin/lessons/course/:courseId
// Admin only — full lesson list for a course, regardless of published status
exports.getLessonsForCourseAdmin = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });

  res.status(200).json({
    success: true,
    message: "Lessons retrieved successfully",
    data: lessons,
  });
});

// @route  GET /api/lessons/:id
// Requires enrollment (via requireEnrollment middleware, sets req.lesson)
exports.getLessonById = asyncHandler(async (req, res) => {
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
});

// @route  POST /api/admin/lessons
// Admin only
exports.createLesson = asyncHandler(async (req, res) => {
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
});

// @route  PUT /api/admin/lessons/:id
// Admin only
exports.updateLesson = asyncHandler(async (req, res) => {
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
});

// @route  DELETE /api/admin/lessons/:id
// Admin only
exports.deleteLesson = asyncHandler(async (req, res) => {
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
});