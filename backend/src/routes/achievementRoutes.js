const express = require("express");
const router = express.Router();
const {
  getAchievements,
  getMyAchievements,
} = require("../controllers/achievementController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAchievements);
router.get("/me", protect, getMyAchievements);

module.exports = router;
