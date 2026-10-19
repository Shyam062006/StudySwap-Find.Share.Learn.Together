'use strict';

const config = require('../config/environment');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Centralized error handler middleware.
 * Must be registered LAST (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log the error server-side
  console.error('[ERROR]', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: config.isProduction ? '[hidden in production]' : err.stack,
  });

  // Handle multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(
      res,
      400,
      `File too large. Maximum allowed size is ${config.upload.maxFileSizeMb}MB.`
    );
  }

  // Handle multer unexpected field
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiResponse.error(res, 400, 'Unexpected file field in upload.');
  }

  // Operational errors (ApiError instances) — safe to expose to client
  if (err.isOperational) {
    return ApiResponse.error(res, err.statusCode, err.message);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.error(res, 409, `Duplicate value for ${field}.`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 401, 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 401, 'Token expired.');
  }

  // Generic server error — never expose internals in production
  const message = config.isProduction
    ? 'Something went wrong. Please try again later.'
    : err.message;

  return ApiResponse.error(res, err.statusCode || 500, message);
}

module.exports = errorHandler;
