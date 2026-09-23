const express = require("express");
const router = express.Router();
const {
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.post("/", createLesson);
router.put("/:id", updateLesson);
router.delete("/:id", deleteLesson);

module.exports = router;