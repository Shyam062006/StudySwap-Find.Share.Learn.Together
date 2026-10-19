'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/environment');

/**
 * Generate a JWT and set it as an httpOnly cookie on the response.
 * @param {import('express').Response} res - Express response object
 * @param {object} payload - Data to encode (e.g. { id, role })
 * @returns {string} The signed JWT string
 */
function generateToken(res, payload) {
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn, // 7d
  });

  res.cookie('token', token, {
    httpOnly: true,                        // Not accessible via JS
    secure: config.cookie.secure,          // HTTPS only in production
    sameSite: config.cookie.secure ? 'none' : 'lax', // 'none' required for cross-domain Vercel frontend <-> backend
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days in milliseconds
    path: '/',
  });

  return token;
}

module.exports = generateToken;
