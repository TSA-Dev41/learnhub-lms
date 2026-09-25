const Course = require("../models/Course");

// @route  GET /api/courses
// Public — published only, with search/filter/pagination
exports.getCourses = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const query = { status: "published" };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load courses. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/admin/courses
// Admin only — returns ALL courses regardless of status
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find({}).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Course.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load courses. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/courses/:id
// Public
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load this course. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/courses/categories
// Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct("category", { status: "published" });
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load categories. Please try again.",
      data: null,
    });
  }
};

// @route  POST /api/admin/courses
// Admin only
exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructor, category, level, thumbnail } = req.body;

    if (!title || !description || !instructor || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, instructor and category are required",
        data: null,
      });
    }

    const course = await Course.create({
      title,
      description,
      instructor,
      category,
      level,
      thumbnail,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create course. Please try again.",
      data: null,
    });
  }
};

// @route  PUT /api/admin/courses/:id
// Admin only
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update course. Please try again.",
      data: null,
    });
  }
};

// @route  DELETE /api/admin/courses/:id
// Admin only
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete course. Please try again.",
      data: null,
    });
  }
};

// @route  PATCH /api/admin/courses/:id/status
// Admin only
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be draft, published or archived",
        data: null,
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Course status updated",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update course status. Please try again.",
      data: null,
    });
  }
};