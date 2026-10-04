const express = require("express");
const router = express.Router();
const { getAllEnrollments } = require("../controllers/adminEnrollmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));
router.get("/", getAllEnrollments);

module.exports = router;
