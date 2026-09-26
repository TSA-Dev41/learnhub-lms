const rateLimit = require("express-rate-limit");

// Limits brute-force attempts on login/register.
// 10 requests per 15 minutes per IP, then blocked with a 429.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // return RateLimit-* headers
  legacyHeaders: false, // disable X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
    data: null,
  },
});

module.exports = { authLimiter };