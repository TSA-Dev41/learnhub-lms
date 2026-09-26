const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/quizzes/:id
// Requires enrollment in the quiz's course. Never returns correctAnswer.
exports.getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz || quiz.status !== "published") {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
      data: null,
    });
  }

  if (req.user.role !== "admin") {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course before accessing its quiz.",
        data: null,
      });
    }
  }

  const questions = await Question.find({ quiz: quiz._id }).select("text options");

  res.status(200).json({
    success: true,
    message: "Quiz retrieved successfully",
    data: {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      questions: questions.map((q) => ({
        id: q._id,
        text: q.text,
        options: q.options,
      })),
    },
  });
});

// @route  GET /api/courses/:id/quizzes
// Public list (titles only) — actual quiz content still requires enrollment via getQuizById
exports.getQuizzesForCourse = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({
    course: req.params.id,
    status: "published",
  }).select("title description passingScore");

  res.status(200).json({
    success: true,
    message: "Quizzes retrieved successfully",
    data: quizzes,
  });
});

// @route  POST /api/quizzes/:id/submit
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Answers are required to submit the quiz",
      data: null,
    });
  }

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz || quiz.status !== "published") {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
      data: null,
    });
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: quiz.course,
  });

  if (!enrollment && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You must enroll in this course before accessing its quiz.",
      data: null,
    });
  }

  const questions = await Question.find({ quiz: quiz._id });

  let earnedPoints = 0;
  let totalPoints = 0;
  const gradedAnswers = [];

  for (const question of questions) {
    totalPoints += question.points;
    const submitted = answers.find(
      (a) => a.questionId === question._id.toString()
    );
    const isCorrect =
      submitted && submitted.selectedOption === question.correctAnswer;

    if (isCorrect) earnedPoints += question.points;

    gradedAnswers.push({
      questionId: question._id,
      selectedOption: submitted ? submitted.selectedOption : "",
      correct: !!isCorrect,
    });
  }

  const scorePercent =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers: gradedAnswers,
    score: scorePercent,
    totalPoints,
    passed,
  });

  res.status(200).json({
    success: true,
    message: "Quiz submitted successfully",
    data: {
      score: scorePercent,
      totalPoints,
      passed,
      attemptId: attempt._id,
    },
  });
});

// @route  GET /api/quizzes/:id/result
exports.getQuizResult = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({
    user: req.user._id,
    quiz: req.params.id,
  })
    .sort({ createdAt: -1 })
    .populate("answers.questionId", "text options correctAnswer");

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "No attempt found for this quiz yet",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Result retrieved successfully",
    data: {
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      passed: attempt.passed,
      submittedAt: attempt.createdAt,
      answers: attempt.answers,
    },
  });
});

// @route  GET /api/admin/quizzes/course/:courseId
// Admin only — all quizzes for a course, regardless of status
exports.getQuizzesForCourseAdmin = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ course: req.params.courseId }).select(
    "title description passingScore timeLimit status"
  );

  res.status(200).json({
    success: true,
    message: "Quizzes retrieved successfully",
    data: quizzes,
  });
});

// @route  GET /api/admin/quizzes/:id
// Admin only — full quiz + questions including correctAnswer, regardless of status
exports.getQuizByIdAdmin = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
      data: null,
    });
  }

  const questions = await Question.find({ quiz: quiz._id });

  res.status(200).json({
    success: true,
    message: "Quiz retrieved successfully",
    data: {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      status: quiz.status,
      questions: questions.map((q) => ({
        id: q._id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
      })),
    },
  });
});

// ---- ADMIN ----

// @route  POST /api/admin/quizzes
exports.createQuiz = asyncHandler(async (req, res) => {
  const { course, title, description, passingScore, timeLimit, status } = req.body;

  if (!course || !title) {
    return res.status(400).json({
      success: false,
      message: "Course and title are required",
      data: null,
    });
  }

  const quiz = await Quiz.create({
    course,
    title,
    description,
    passingScore,
    timeLimit,
    status,
  });

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});

// @route  PUT /api/admin/quizzes/:id
exports.updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Quiz updated successfully",
    data: quiz,
  });
});

// @route  DELETE /api/admin/quizzes/:id
exports.deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
      data: null,
    });
  }

  await Question.deleteMany({ quiz: quiz._id });

  res.status(200).json({
    success: true,
    message: "Quiz deleted",
    data: null,
  });
});

// @route  POST /api/admin/quizzes/:id/questions
exports.addQuestion = asyncHandler(async (req, res) => {
  const { text, options, correctAnswer, points } = req.body;

  if (!text || !options || !correctAnswer) {
    return res.status(400).json({
      success: false,
      message: "Text, options, and correct answer are required",
      data: null,
    });
  }

  const question = await Question.create({
    quiz: req.params.id,
    text,
    options,
    correctAnswer,
    points,
  });

  res.status(201).json({
    success: true,
    message: "Question added successfully",
    data: question,
  });
});

// @route  PUT /api/admin/questions/:id
exports.updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!question) {
    return res.status(404).json({
      success: false,
      message: "Question not found",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Question updated successfully",
    data: question,
  });
});

// @route  DELETE /api/admin/questions/:id
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: "Question not found",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Question deleted",
    data: null,
  });
});