'use strict';

const { body } = require('express-validator');

/**
 * Validation rules for POST /api/auth/register
 */
const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('college')
    .trim()
    .notEmpty().withMessage('College name is required.')
    .isLength({ min: 2, max: 200 }).withMessage('College name must be between 2 and 200 characters.'),

  body('degree')
    .trim()
    .notEmpty().withMessage('Degree is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Degree must be between 1 and 100 characters.'),

  body('branch')
    .trim()
    .notEmpty().withMessage('Branch is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Branch must be between 1 and 100 characters.'),

  body('semester')
    .notEmpty().withMessage('Semester is required.')
    .isInt({ min: 1, max: 8 }).withMessage('Semester must be an integer between 1 and 8.')
    .toInt(),
];

/**
 * Validation rules for POST /api/auth/login
 */
const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

module.exports = { registerValidators, loginValidators };
