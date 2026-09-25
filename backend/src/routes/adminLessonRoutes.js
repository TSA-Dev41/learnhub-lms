const express = require("express");
const router = express.Router();
const {
  getLessonsForCourseAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/course/:courseId", getLessonsForCourseAdmin);
router.post("/", createLesson);
router.put("/:id", updateLesson);
router.delete("/:id", deleteLesson);

module.exports = router;