'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/environment');

/**
 * General rate limiter:
 * High allowance in development (10,000 req / 15 min) so browsing and dev refreshes don't hit 429.
 * Production allowance: 1,000 req / 15 min.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction ? 1000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.',
  },
});

/**
 * Auth rate limiter: stricter for login/register in production, generous in development.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction ? 30 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

module.exports = { generalLimiter, authLimiter };

