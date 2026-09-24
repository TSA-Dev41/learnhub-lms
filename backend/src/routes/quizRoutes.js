const express = require("express");
const router = express.Router();
const {
  getQuizById,
  submitQuiz,
  getQuizResult,
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:id", protect, getQuizById);
router.post("/:id/submit", protect, submitQuiz);
router.get("/:id/result", protect, getQuizResult);

module.exports = router;