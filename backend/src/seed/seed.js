require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt = require("../models/QuizAttempt");

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected. Wiping existing data...");

    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      Enrollment.deleteMany({}),
      LessonProgress.deleteMany({}),
      QuizAttempt.deleteMany({}),
    ]);

    console.log("Creating users...");
    // Passwords are hashed by the User model's pre-save hook — pass plaintext here.
    const admin = await User.create({
      name: "Chris Admin",
      email: "chris@example.com",
      password: "password123",
      role: "admin",
    });

    const student = await User.create({
      name: "Demo Student",
      email: "student@example.com",
      password: "password123",
      role: "student",
    });

    const outsider = await User.create({
      name: "Outsider Student",
      email: "outsider@example.com",
      password: "password123",
      role: "student",
    });

    console.log("Creating course...");
    const course = await Course.create({
      title: "JavaScript Fundamentals",
      description: "Learn the core building blocks of JavaScript.",
      instructor: admin._id,
      category: "Programming",
      level: "beginner",
      thumbnail: "",
      status: "published",
    });

    console.log("Creating lesson...");
    const lesson = await Lesson.create({
      course: course._id,
      title: "Introduction",
      description: "Getting started with JS.",
      content: "Welcome to JavaScript Fundamentals. In this lesson...",
      videoUrl: "",
      order: 1,
      duration: 10,
      published: true,
    });

    console.log("Creating quiz + question...");
    const quiz = await Quiz.create({
      course: course._id,
      title: "JS Basics Quiz",
      description: "Test your understanding of the basics.",
      passingScore: 70,
      timeLimit: 0,
      status: "published",
    });

    const question = await Question.create({
      quiz: quiz._id,
      text: "What keyword declares a variable that cannot be reassigned?",
      options: ["var", "let", "const", "static"],
      correctAnswer: "const",
      points: 100,
    });

    console.log("Enrolling demo student + marking progress...");
    await Enrollment.create({
      student: student._id,
      course: course._id,
      status: "completed",
    });

    await LessonProgress.create({
      user: student._id,
      lesson: lesson._id,
      course: course._id,
      completedAt: new Date(),
    });

    await QuizAttempt.create({
      user: student._id,
      quiz: quiz._id,
      answers: [
        {
          questionId: question._id,
          selectedOption: "const",
          correct: true,
        },
      ],
      score: 100,
      totalPoints: 100,
      passed: true,
    });

    // Extra draft course for admin-panel testing
    console.log("Creating draft course for admin testing...");
    await Course.create({
      title: "UI/UX Fundamentals",
      description: "Design principles for great user experiences.",
      instructor: admin._id,
      category: "Design",
      level: "beginner",
      thumbnail: "",
      status: "draft",
    });

    console.log("✅ Seed complete.");
    console.log(`Admin:    chris@example.com / password123`);
    console.log(`Student:  student@example.com / password123`);
    console.log(`Outsider: outsider@example.com / password123`);
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seed();