'use strict';

const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { createUser, findUserByEmail, findUserById } = require('../models/User');
const { getUserPoints } = require('../services/contributionService');
const { getUserBadges } = require('../models/Badge');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Build a safe user object with status, contributionPoints, badges.
 */
async function buildSafeUser(db, user) {
  const { passwordHash: _, ...safeUser } = user;

  let points = 0;
  let badges = [];
  try {
    [points, badges] = await Promise.all([
      getUserPoints(db, user._id),
      getUserBadges(db, user._id),
    ]);
  } catch { /* ignore for fresh users */ }

  return {
    ...safeUser,
    status: user.isActive === false ? 'restricted' : 'active',
    contributionPoints: points,
    badges: badges.map(b => b.badge || b),
  };
}

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const db = getDb();
    const { name, email, password, college, degree, branch, semester } = req.body;

    const existing = await findUserByEmail(db, email);
    if (existing) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser(db, {
      name,
      email,
      passwordHash,
      college,
      degree,
      branch,
      semester,
      role: 'student',
    });

    generateToken(res, { id: user._id.toString(), role: user.role });

    const safeUser = await buildSafeUser(db, user);
    return ApiResponse.success(res, 201, 'Registration successful.', safeUser);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const db = getDb();
    const { email, password } = req.body;

    const user = await findUserByEmail(db, email);
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    if (user.isActive === false) {
      return next(ApiError.unauthorized('Your account has been restricted. Please contact an administrator.'));
    }

    generateToken(res, { id: user._id.toString(), role: user.role });

    const safeUser = await buildSafeUser(db, user);
    return ApiResponse.success(res, 200, 'Login successful.', safeUser);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
  return ApiResponse.success(res, 200, 'Logged out successfully.');
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const db = getDb();
    const user = await findUserById(db, req.user._id);
    if (!user) return next(ApiError.notFound('User not found.'));

    const safeUser = await buildSafeUser(db, user);
    return ApiResponse.success(res, 200, 'Authenticated user.', safeUser);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
