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

    console.log("Creating courses...");

    // Each course: title, description, category, level, thumbnail seed (for picsum),
    // and 1-2 lesson titles. Picsum with a fixed seed gives a stable, real-looking
    // photo per course (not thematically matched, but consistent and never broken).
    const courseDefs = [
      {
        title: "JavaScript Fundamentals",
        description: "Learn the core building blocks of JavaScript, from variables to functions to the DOM.",
        category: "Web Development",
        level: "beginner",
        seed: "js-fundamentals",
        lessons: ["Introduction", "Variables & Data Types"],
      },
      {
        title: "React for Beginners",
        description: "Build interactive user interfaces with React, hooks, and component-based design.",
        category: "Web Development",
        level: "beginner",
        seed: "react-beginners",
        lessons: ["Getting Started with Components", "State and Props"],
      },
      {
        title: "Node.js & Express Crash Course",
        description: "Build a REST API from scratch using Node.js, Express, and MongoDB.",
        category: "Web Development",
        level: "intermediate",
        seed: "node-express",
        lessons: ["Setting Up Your First Server"],
      },
      {
        title: "Python for Data Analysis",
        description: "Use Python, Pandas, and NumPy to clean, analyze, and visualize real-world datasets.",
        category: "Data Science",
        level: "beginner",
        seed: "python-data",
        lessons: ["Introduction to Pandas", "Cleaning Messy Data"],
      },
      {
        title: "Machine Learning Foundations",
        description: "Understand the math and intuition behind core machine learning algorithms.",
        category: "Data Science",
        level: "intermediate",
        seed: "ml-foundations",
        lessons: ["What is Machine Learning?"],
      },
      {
        title: "UI/UX Design Principles",
        description: "Learn the fundamentals of user-centered design, wireframing, and prototyping.",
        category: "Design",
        level: "beginner",
        seed: "uiux-principles",
        lessons: ["Design Thinking Basics", "Wireframing Your First App"],
      },
      {
        title: "Digital Marketing Essentials",
        description: "Master the fundamentals of SEO, social media, and content marketing strategy.",
        category: "Marketing",
        level: "beginner",
        seed: "digital-marketing",
        lessons: ["Understanding Your Audience"],
      },
      {
        title: "Public Speaking with Confidence",
        description: "Overcome stage fright and structure compelling talks and presentations.",
        category: "Personal Development",
        level: "beginner",
        seed: "public-speaking",
        lessons: ["Structuring Your First Talk"],
      },
      {
        title: "Photography Basics",
        description: "Learn composition, lighting, and camera settings to take better photos, on any camera.",
        category: "Photography",
        level: "beginner",
        seed: "photography-basics",
        lessons: ["Understanding Exposure", "Composition Rules Worth Knowing"],
      },
    ];

    const createdCourses = [];
    for (const def of courseDefs) {
      const course = await Course.create({
        title: def.title,
        description: def.description,
        instructor: admin._id,
        category: def.category,
        level: def.level,
        thumbnail: `https://picsum.photos/seed/${def.seed}/600/400`,
        status: "published",
      });

      let order = 1;
      const lessonsForCourse = [];
      for (const lessonTitle of def.lessons) {
        const lesson = await Lesson.create({
          course: course._id,
          title: lessonTitle,
          description: `Part of ${def.title}.`,
          content: `Welcome to "${lessonTitle}". This lesson covers key concepts in ${def.title}.`,
          videoUrl: "",
          order: order++,
          duration: 10,
          published: true,
        });
        lessonsForCourse.push(lesson);
      }

      createdCourses.push({ course, lessons: lessonsForCourse });
    }

    // Extra draft course for admin-panel testing (unchanged from before)
    console.log("Creating draft course for admin testing...");
    await Course.create({
      title: "Advanced Course Design (Draft)",
      description: "An unfinished course used to test the admin draft/publish workflow.",
      instructor: admin._id,
      category: "Design",
      level: "advanced",
      thumbnail: `https://picsum.photos/seed/draft-course/600/400`,
      status: "draft",
    });

    // ---- Quiz on the first course (JavaScript Fundamentals), as before ----
    const jsCourseEntry = createdCourses[0];
    console.log("Creating quiz + question for JavaScript Fundamentals...");
    const quiz = await Quiz.create({
      course: jsCourseEntry.course._id,
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

    // ---- Demo student: enroll in the first 3 courses, complete lessons on the first ----
    console.log("Enrolling demo student in a few courses...");
    for (const entry of createdCourses.slice(0, 3)) {
      await Enrollment.create({
        student: student._id,
        course: entry.course._id,
        status: entry === jsCourseEntry ? "completed" : "active",
      });
    }

    // Mark the JS Fundamentals lessons complete + pass the quiz, so Dashboard/progress
    // views have realistic-looking data to show.
    for (const lesson of jsCourseEntry.lessons) {
      await LessonProgress.create({
        user: student._id,
        lesson: lesson._id,
        course: jsCourseEntry.course._id,
        completedAt: new Date(),
      });
    }

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

    console.log("✅ Seed complete.");
    console.log(`Created ${createdCourses.length} published courses + 1 draft course.`);
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