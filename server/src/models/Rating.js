'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'ratings';

/**
 * Create unique compound index on userId + resourceId.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex(
    { userId: 1, resourceId: 1 },
    { unique: true }
  );
}

/**
 * Create or update a rating for a user+resource pair.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @param {number} rating - 1 to 5
 * @returns {Promise<object>} The upserted rating document
 */
async function upsertRating(db, userId, resourceId, rating) {
  const uid = new ObjectId(userId);
  const rid = new ObjectId(resourceId);
  const now = new Date();

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { userId: uid, resourceId: rid },
    {
      $set: { rating, updatedAt: now },
      $setOnInsert: { userId: uid, resourceId: rid, createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );
  return result;
}

/**
 * Calculate average rating and count for a resource.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} resourceId
 * @returns {Promise<{ average: number, count: number }>}
 */
async function getResourceRatingStats(db, resourceId) {
  const rid = new ObjectId(resourceId);

  const [result] = await db.collection(COLLECTION).aggregate([
    { $match: { resourceId: rid } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  if (!result) return { average: 5, count: 1 };
  return {
    average: Math.round(result.average * 10) / 10, // round to 1 decimal
    count: result.count,
  };
}

/**
 * Get a user's rating for a specific resource.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<object|null>}
 */
async function getUserRating(db, userId, resourceId) {
  return db.collection(COLLECTION).findOne({
    userId: new ObjectId(userId),
    resourceId: new ObjectId(resourceId),
  });
}

module.exports = { createIndexes, upsertRating, getResourceRatingStats, getUserRating };
