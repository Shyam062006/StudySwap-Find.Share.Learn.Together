'use strict';

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const {
  createReview,
  findReviewsByResource,
  findReviewById,
  updateReview,
  deleteReview,
  getUserReviewForResource,
} = require('../models/Review');
const { findResourceById } = require('../models/Resource');
const { awardPoints } = require('../services/contributionService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/resources/:id/reviews
 * Frontend expects: [{ _id, user: { _id, name }, comment, createdAt }]
 */
async function getReviews(req, res, next) {
  try {
    const db = getDb();
    const resourceId = req.params.id;

    const { reviews } = await findReviewsByResource(db, resourceId, { page: 1, limit: 100 });

    // Enrich with user info
    const enriched = reviews.map((r) => {
      const u = r.author || {};
      return {
        _id: r._id,
        user: { _id: u._id || r.userId, name: u.name || 'Student' },
        comment: r.comment,
        createdAt: r.createdAt,
      };
    });

    return ApiResponse.success(res, 200, 'Reviews fetched.', enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/resources/:id/reviews
 * Body: { comment }
 */
async function createReviewHandler(req, res, next) {
  try {
    const db = getDb();
    const resourceId = req.params.id;
    const { comment } = req.body;

    if (!comment || comment.trim().length < 10) {
      return next(ApiError.badRequest('Comment must be at least 10 characters.'));
    }

    const resource = await findResourceById(db, resourceId);
    if (!resource || (resource.moderationStatus !== 'approved' && resource.moderationStatus !== 'published')) {
      return next(ApiError.notFound('Resource not found.'));
    }

    // Prevent self-review
    if (resource.uploaderId.toString() === req.user._id.toString()) {
      return next(ApiError.forbidden('You cannot review your own resource.'));
    }

    // Prevent duplicate
    const existing = await getUserReviewForResource(db, req.user._id, resourceId);
    if (existing) {
      return next(ApiError.conflict('You have already reviewed this resource.'));
    }

    const review = await createReview(db, {
      userId: req.user._id,
      resourceId: new ObjectId(resourceId),
      comment: comment.trim(),
    });

    // Award points
    const ref = `review_received:${review._id}`;
    await awardPoints(db, resource.uploaderId, 'review_received', 2, resourceId, ref).catch(() => {});

    // Enrich response
    const user = await db.collection('users').findOne(
      { _id: req.user._id },
      { projection: { name: 1 } }
    );

    return ApiResponse.success(res, 201, 'Review submitted.', {
      _id: review._id,
      user: user ? { _id: user._id, name: user.name } : { _id: req.user._id, name: 'Unknown' },
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/reviews/:id
 * Body: { comment }
 */
async function updateReviewHandler(req, res, next) {
  try {
    const db = getDb();
    const review = await findReviewById(db, req.params.id);
    if (!review) return next(ApiError.notFound('Review not found.'));

    if (review.userId.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only edit your own reviews.'));
    }

    const updated = await updateReview(db, req.params.id, { comment: req.body.comment });

    const user = await db.collection('users').findOne(
      { _id: review.userId },
      { projection: { name: 1 } }
    );

    return ApiResponse.success(res, 200, 'Review updated.', {
      _id: updated._id,
      user: user ? { _id: user._id, name: user.name } : { _id: review.userId, name: 'Unknown' },
      comment: updated.comment,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/reviews/:id
 */
async function deleteReviewHandler(req, res, next) {
  try {
    const db = getDb();
    const review = await findReviewById(db, req.params.id);
    if (!review) return next(ApiError.notFound('Review not found.'));

    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(ApiError.forbidden('You do not have permission to delete this review.'));
    }

    await deleteReview(db, req.params.id);
    return ApiResponse.success(res, 200, 'Review deleted.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReviews,
  createReview: createReviewHandler,
  updateReview: updateReviewHandler,
  deleteReview: deleteReviewHandler,
};
