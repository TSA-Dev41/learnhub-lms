const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are all required",
        data: null,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
        data: null,
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while registering",
      data: null,
    });
  }
};

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        data: null,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Your email or password is incorrect",
        data: null,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Your email or password is incorrect",
        data: null,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
      data: null,
    });
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User retrieved",
    data: req.user,
  });
};