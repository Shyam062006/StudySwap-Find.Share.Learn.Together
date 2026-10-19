'use strict';

const { getDb } = require('../config/database');
const { upsertRating, getResourceRatingStats, getUserRating } = require('../models/Rating');
const { findResourceById, updateResource } = require('../models/Resource');
const { awardPoints } = require('../services/contributionService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * PUT /api/resources/:id/rating
 * Body: { rating: 1..5 }
 */
async function upsertRatingHandler(req, res, next) {
  try {
    const db = getDb();
    const resourceId = req.params.id;
    const { rating } = req.body;

    const resource = await findResourceById(db, resourceId);
    if (!resource || (resource.moderationStatus !== 'approved' && resource.moderationStatus !== 'published')) {
      return next(ApiError.notFound('Resource not found.'));
    }

    // Prevent self-rating
    if (resource.uploaderId.toString() === req.user._id.toString()) {
      return next(ApiError.forbidden('You cannot rate your own resource.'));
    }

    const existingRating = await getUserRating(db, req.user._id, resourceId);
    const isNewRating = !existingRating;

    await upsertRating(db, req.user._id, resourceId, parseInt(rating, 10));

    // Recalculate
    const stats = await getResourceRatingStats(db, resourceId);
    await updateResource(db, resourceId, {
      averageRating: stats.average,
      ratingCount: stats.count,
    });

    // Award points on first good rating
    if (isNewRating && parseInt(rating, 10) >= 4) {
      const ref = `helpful_rating:${resourceId}:${req.user._id}`;
      await awardPoints(db, resource.uploaderId, 'helpful_rating', 2, resourceId, ref).catch(() => {});
    }

    return ApiResponse.success(res, 200, 'Rating submitted.', {
      averageRating: stats.average,
      ratingCount: stats.count,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { upsertRating: upsertRatingHandler };
