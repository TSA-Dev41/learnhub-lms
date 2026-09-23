const express = require("express");
const router = express.Router();
const { getMyEnrollments } = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMyEnrollments);

module.exports = router;