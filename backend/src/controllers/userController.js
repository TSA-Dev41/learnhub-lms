const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

// @route  GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    message: "Profile retrieved",
    data: publicUser(user),
  });
});

// @route  PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null,
    });
  }

  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
        data: null,
      });
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();

  if (newPassword || currentPassword) {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are both required",
        data: null,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
        data: null,
      });
    }

    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
        data: null,
      });
    }

    user.password = newPassword;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated",
    data: publicUser(user),
  });
});
