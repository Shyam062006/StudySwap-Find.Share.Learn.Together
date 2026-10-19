'use strict';

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { updateUser, findUserById } = require('../models/User');
const { getUserPoints } = require('../services/contributionService');
const { getUserBadges } = require('../models/Badge');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/users/me
 * Get current user profile with points, badges, and stats.
 */
async function getMe(req, res, next) {
  try {
    const db = getDb();
    const user = await findUserById(db, req.user._id);
    if (!user) return next(ApiError.notFound('User not found.'));

    const uid = user._id;

    const [points, badges, uploadCount, approvedCount, totalDownloads] = await Promise.all([
      getUserPoints(db, uid),
      getUserBadges(db, uid),
      db.collection('resources').countDocuments({ uploaderId: uid }),
      db.collection('resources').countDocuments({ uploaderId: uid, moderationStatus: { $in: ['approved', 'published'] } }),
      db.collection('resources').aggregate([
        { $match: { uploaderId: uid, moderationStatus: { $in: ['approved', 'published'] } } },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]).toArray().then(r => r[0]?.total || 0),
    ]);

    const { passwordHash: _, ...safeUser } = user;

    return ApiResponse.success(res, 200, 'Profile fetched.', {
      ...safeUser,
      status: user.isActive === false ? 'restricted' : 'active',
      contributionPoints: points,
      badges: badges.map(b => b.badge || b),
      stats: {
        uploads: uploadCount,
        approved: approvedCount,
        downloads: totalDownloads,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/me
 */
async function updateMe(req, res, next) {
  try {
    const db = getDb();

    const allowedFields = ['name', 'college', 'degree', 'branch', 'semester'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(ApiError.badRequest('No valid fields provided for update.'));
    }

    const updated = await updateUser(db, req.user._id, updates);
    if (!updated) return next(ApiError.notFound('User not found.'));

    const { passwordHash: _, ...safeUser } = updated;
    return ApiResponse.success(res, 200, 'Profile updated.', {
      ...safeUser,
      status: updated.isActive === false ? 'restricted' : 'active',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
