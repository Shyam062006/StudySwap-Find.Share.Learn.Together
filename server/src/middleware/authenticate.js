'use strict';

const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/User');
const { getDb } = require('../config/database');
const ApiError = require('../utils/ApiError');
const config = require('../config/environment');

/**
 * Middleware: verify JWT from httpOnly cookie and attach user to req.user.
 * Returns 401 if token is missing or invalid.
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return next(ApiError.unauthorized('No authentication token provided.'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return next(ApiError.unauthorized('Invalid or expired token.'));
    }

    const db = getDb();
    const user = await findUserById(db, decoded.id);

    if (!user) {
      return next(ApiError.unauthorized('User not found.'));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized('Account is deactivated. Please contact support.'));
    }

    // Remove sensitive data before attaching
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
