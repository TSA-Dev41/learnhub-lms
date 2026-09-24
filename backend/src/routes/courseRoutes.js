const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  getCategories,
} = require("../controllers/courseController");
const { getLessonsForCourse } = require("../controllers/lessonController");
const { enrollInCourse } = require("../controllers/enrollmentController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.get("/categories", getCategories);
router.get("/:id/lessons", optionalAuth, getLessonsForCourse);
router.post("/:id/enroll", protect, enrollInCourse);
router.get("/:id", getCourseById);
router.get("/", getCourses);

module.exports = router;