const express = require("express");
const router = express.Router();
const {
  getMyProgress,
  getCourseProgress,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyProgress);
router.get("/:courseId", protect, getCourseProgress);

module.exports = router;