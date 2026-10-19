'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'bookmarks';

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
 * Add a bookmark for a user+resource pair.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<object>} The inserted bookmark
 */
async function addBookmark(db, userId, resourceId) {
  const doc = {
    userId: new ObjectId(userId),
    resourceId: new ObjectId(resourceId),
    createdAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Remove a bookmark.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<boolean>}
 */
async function removeBookmark(db, userId, resourceId) {
  const result = await db.collection(COLLECTION).deleteOne({
    userId: new ObjectId(userId),
    resourceId: new ObjectId(resourceId),
  });
  return result.deletedCount === 1;
}

/**
 * Get all bookmarked resource IDs for a user.
 * Performs a lookup to include resource details.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<object[]>}
 */
async function getUserBookmarks(db, userId) {
  return db.collection(COLLECTION).aggregate([
    { $match: { userId: new ObjectId(userId) } },
    {
      $lookup: {
        from: 'resources',
        localField: 'resourceId',
        foreignField: '_id',
        as: 'resource',
      },
    },
    { $unwind: '$resource' },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        resource: 1,
      },
    },
  ]).toArray();
}

/**
 * Check if a user has bookmarked a specific resource.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<boolean>}
 */
async function isBookmarked(db, userId, resourceId) {
  const doc = await db.collection(COLLECTION).findOne({
    userId: new ObjectId(userId),
    resourceId: new ObjectId(resourceId),
  });
  return !!doc;
}

module.exports = { createIndexes, addBookmark, removeBookmark, getUserBookmarks, isBookmarked };
