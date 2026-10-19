'use strict';

const { Router } = require('express');
const { register, login, logout, me } = require('../controllers/authController');
const { registerValidators, loginValidators } = require('../validators/authValidators');
const validateRequest = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/register', authLimiter, registerValidators, validateRequest, register);
router.post('/login', authLimiter, loginValidators, validateRequest, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Password reset instructions have been logged. Please contact an administrator for assistance.',
  });
});

module.exports = router;
