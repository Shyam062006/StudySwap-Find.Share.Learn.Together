'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'downloads';

/**
 * Create indexes for the downloads collection.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ resourceId: 1 });
  await db.collection(COLLECTION).createIndex({ userId: 1 });
}

/**
 * Record a download event.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<object>}
 */
async function recordDownload(db, userId, resourceId) {
  const doc = {
    userId: new ObjectId(userId),
    resourceId: new ObjectId(resourceId),
    downloadedAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Count total downloads for a resource.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} resourceId
 * @returns {Promise<number>}
 */
async function getDownloadCount(db, resourceId) {
  return db.collection(COLLECTION).countDocuments({ resourceId: new ObjectId(resourceId) });
}

/**
 * Get all download records for a user.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<object[]>}
 */
async function getUserDownloads(db, userId) {
  return db.collection(COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .sort({ downloadedAt: -1 })
    .toArray();
}

module.exports = { createIndexes, recordDownload, getDownloadCount, getUserDownloads };
