const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const adminCourseRoutes = require("./routes/adminCourseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const adminLessonRoutes = require("./routes/adminLessonRoutes");
const quizRoutes = require("./routes/quizRoutes");
const adminQuizRoutes = require("./routes/adminQuizRoutes");
const adminQuestionRoutes = require("./routes/adminQuestionRoutes");
const progressRoutes = require("./routes/progressRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "LearnHub API is running", data: null });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin/courses", adminCourseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/admin/lessons", adminLessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin/quizzes", adminQuizRoutes);
app.use("/api/admin/questions", adminQuestionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin/students", require("./routes/adminStudentRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;