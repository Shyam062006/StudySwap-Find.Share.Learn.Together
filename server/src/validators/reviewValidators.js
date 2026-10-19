'use strict';

const { body } = require('express-validator');

/**
 * Validation rules for POST /api/reviews (create review)
 */
const createReviewValidators = [
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Comment must be between 10 and 2000 characters.'),
];

/**
 * Validation rules for PUT /api/reviews/:id (update review)
 */
const updateReviewValidators = [
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Comment must be between 10 and 2000 characters.'),
];

/**
 * Validation rules for POST /api/ratings (upsert rating)
 */
const ratingValidators = [
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.')
    .toInt(),
];

module.exports = { createReviewValidators, updateReviewValidators, ratingValidators };
