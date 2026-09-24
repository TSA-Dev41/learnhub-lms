const express = require("express");
const router = express.Router();
const {
  updateQuestion,
  deleteQuestion,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

module.exports = router;