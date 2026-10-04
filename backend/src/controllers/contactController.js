const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../utils/asyncHandler");

const emailLooksOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// @route  POST /api/contact
exports.sendMessage = asyncHandler(async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const message = (req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email and message are all required",
      data: null,
    });
  }

  if (!emailLooksOk(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email",
      data: null,
    });
  }

  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Message should be at least 10 characters",
      data: null,
    });
  }

  const saved = await ContactMessage.create({ name, email, message });

  res.status(201).json({
    success: true,
    message: "Message sent. We will get back to you soon.",
    data: { id: saved._id },
  });
});

// @route  GET /api/admin/messages
exports.getMessages = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    message: "Messages retrieved",
    data: messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

// @route  PATCH /api/admin/messages/:id/read
exports.markMessageRead = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
      data: null,
    });
  }

  message.read = true;
  await message.save();

  res.status(200).json({
    success: true,
    message: "Message marked as read",
    data: message,
  });
});
