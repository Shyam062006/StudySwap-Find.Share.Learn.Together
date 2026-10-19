'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin') or authorize('student', 'admin')
 *
 * Must be used AFTER the authenticate middleware.
 * @param {...string} roles - Allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('You must be logged in.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

module.exports = authorize;
