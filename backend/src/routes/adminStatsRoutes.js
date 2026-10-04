const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/adminStatsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));
router.get("/", getStats);

module.exports = router;
