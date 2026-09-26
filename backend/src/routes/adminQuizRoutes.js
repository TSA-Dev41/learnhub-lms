const express = require("express");
const router = express.Router();
const {
  getQuizzesForCourseAdmin,
  getQuizByIdAdmin,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/course/:courseId", getQuizzesForCourseAdmin);
router.get("/:id", getQuizByIdAdmin);
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);
router.post("/:id/questions", addQuestion);

module.exports = router;