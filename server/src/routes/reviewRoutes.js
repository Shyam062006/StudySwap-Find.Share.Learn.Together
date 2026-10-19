'use strict';

const { Router } = require('express');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { createReviewValidators, updateReviewValidators } = require('../validators/reviewValidators');
const validateRequest = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');

const router = Router();

// Public: get reviews for a resource
router.get('/resources/:id/reviews', getReviews);

// Authenticated: create review
router.post('/resources/:id/reviews', authenticate, createReviewValidators, validateRequest, createReview);

// Authenticated: update own review
router.patch('/reviews/:id', authenticate, updateReviewValidators, validateRequest, updateReview);

// Authenticated: delete own review
router.delete('/reviews/:id', authenticate, deleteReview);

module.exports = router;
