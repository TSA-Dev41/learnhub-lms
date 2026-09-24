const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const Enrollment = require("../models/Enrollment");

// @route  GET /api/quizzes/:id
// Requires enrollment in the quiz's course. Never returns correctAnswer.
exports.getQuizById = async (req, res) => {
  try {
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

    const questions = await Question.find({ quiz: quiz._id }).select(
      "text options"
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load this quiz. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/courses/:id/quizzes
// Public list (titles only) — actual quiz content still requires enrollment via getQuizById
exports.getQuizzesForCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      course: req.params.id,
      status: "published",
    }).select("title description passingScore");

    res.status(200).json({
      success: true,
      message: "Quizzes retrieved successfully",
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load quizzes for this course. Please try again.",
      data: null,
    });
  }
};

// @route  POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to submit quiz. Please try again.",
      data: null,
    });
  }
};

// @route  GET /api/quizzes/:id/result
exports.getQuizResult = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load quiz result. Please try again.",
      data: null,
    });
  }
};

// ---- ADMIN ----

// @route  POST /api/admin/quizzes
exports.createQuiz = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create quiz. Please try again.",
      data: null,
    });
  }
};

// @route  PUT /api/admin/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update quiz. Please try again.",
      data: null,
    });
  }
};

// @route  DELETE /api/admin/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete quiz. Please try again.",
      data: null,
    });
  }
};

// @route  POST /api/admin/quizzes/:id/questions
exports.addQuestion = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add question. Please try again.",
      data: null,
    });
  }
};

// @route  PUT /api/admin/questions/:id
exports.updateQuestion = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update question. Please try again.",
      data: null,
    });
  }
};

// @route  DELETE /api/admin/questions/:id
exports.deleteQuestion = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete question. Please try again.",
      data: null,
    });
  }
};