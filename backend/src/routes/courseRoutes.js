const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  getCategories,
} = require("../controllers/courseController");

router.get("/categories", getCategories);
router.get("/:id", getCourseById);
router.get("/", getCourses);

module.exports = router;