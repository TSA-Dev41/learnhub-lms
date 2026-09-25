const express = require("express");
const router = express.Router();
const {
  getAllCoursesAdmin,
  getCourseByIdAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/", getAllCoursesAdmin);
router.get("/:id", getCourseByIdAdmin);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.patch("/:id/status", updateCourseStatus);

module.exports = router;