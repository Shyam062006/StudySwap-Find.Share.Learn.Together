'use strict';

const { Router } = require('express');
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
} = require('../controllers/resourceController');
const { upsertRating } = require('../controllers/ratingController');
const { createResourceValidators, updateResourceValidators } = require('../validators/resourceValidators');
const { ratingValidators } = require('../validators/reviewValidators');
const validateRequest = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const { upload } = require('../middleware/upload');

const router = Router();

// Public: get approved resources
router.get('/', getResources);

// Public: single resource details
router.get('/:id', getResourceById);

// Authenticated: upload a new resource
router.post('/', authenticate, upload.single('file'), createResourceValidators, validateRequest, createResource);

// Authenticated: update own resource
router.patch('/:id', authenticate, updateResourceValidators, validateRequest, updateResource);

// Authenticated: delete own resource
router.delete('/:id', authenticate, deleteResource);

// Authenticated: download resource file
router.get('/:id/download', authenticate, downloadResource);

// Authenticated: rate resource (PUT /api/resources/:id/rating)
router.put('/:id/rating', authenticate, ratingValidators, validateRequest, upsertRating);

module.exports = router;
