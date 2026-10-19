'use strict';

const { Router } = require('express');
const { upsertRating } = require('../controllers/ratingController');
const { ratingValidators } = require('../validators/reviewValidators');
const validateRequest = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');

const router = Router();

// Put rating on a resource — creates or updates
router.put('/:id/rating', authenticate, ratingValidators, validateRequest, upsertRating);

module.exports = router;
