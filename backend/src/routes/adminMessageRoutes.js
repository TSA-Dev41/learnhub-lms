const express = require("express");
const router = express.Router();
const { getMessages, markMessageRead } = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));
router.get("/", getMessages);
router.patch("/:id/read", markMessageRead);

module.exports = router;
