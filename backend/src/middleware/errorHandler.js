// 404 handler — runs when no route matched.
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

// Centralized error handler — must be registered LAST, after all routes.
// Any error passed to next(err), or thrown inside an asyncHandler-wrapped
// function, ends up here.
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  // Mongoose bad ObjectId (e.g. /api/courses/123 with a malformed id)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key (e.g. unique index violation)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field} already in use`
      : "Duplicate field value";
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    // Only include the stack trace outside production, so nothing
    // sensitive leaks to clients once this is deployed.
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };