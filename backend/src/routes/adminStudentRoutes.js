const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  getStudentEnrollments,
  getStudentProgress,
} = require("../controllers/adminStudentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.get("/:id/enrollments", getStudentEnrollments);
router.get("/:id/progress", getStudentProgress);

module.exports = router;