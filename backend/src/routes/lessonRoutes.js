const express = require("express");
const router = express.Router();
const { getLessonById } = require("../controllers/lessonController");
const { protect } = require("../middleware/authMiddleware");
const { requireEnrollment } = require("../middleware/enrollmentMiddleware");
const { markLessonComplete } = require("../controllers/progressController"); // built in Phase 4 stub below

router.get("/:id", protect, requireEnrollment, getLessonById);
router.post("/:id/complete", protect, requireEnrollment, markLessonComplete);

module.exports = router;