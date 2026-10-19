'use strict';

/**
 * Custom operational error class.
 * isOperational = true means this is a known, expected error (e.g. 404, validation)
 * as opposed to unexpected programmer errors.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {boolean} isOperational - Whether this is an expected operational error
   */
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity') {
    return new ApiError(422, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;
