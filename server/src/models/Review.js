'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'reviews';

/**
 * Create indexes for the reviews collection.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ resourceId: 1 });
  await db.collection(COLLECTION).createIndex({ userId: 1, resourceId: 1 });
}

/**
 * Create a new review.
 * @param {import('mongodb').Db} db
 * @param {object} data - { userId, resourceId, comment }
 * @returns {Promise<object>}
 */
async function createReview(db, data) {
  const now = new Date();
  const doc = {
    userId: new ObjectId(data.userId),
    resourceId: new ObjectId(data.resourceId),
    comment: data.comment,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Find all reviews for a resource with pagination.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} resourceId
 * @param {object} options - { page, limit }
 * @returns {Promise<{ reviews: object[], total: number }>}
 */
async function findReviewsByResource(db, resourceId, options = {}) {
  const rid = new ObjectId(resourceId);
  const page = parseInt(options.page, 10) || 1;
  const limit = Math.min(parseInt(options.limit, 10) || 10, 50);
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: { resourceId: rid } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'author',
      },
    },
    { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        userId: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
        'author._id': 1,
        'author.name': 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [reviews, total] = await Promise.all([
    db.collection(COLLECTION).aggregate(pipeline).toArray(),
    db.collection(COLLECTION).countDocuments({ resourceId: rid }),
  ]);

  return { reviews, total };
}

/**
 * Find a review by its ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<object|null>}
 */
async function findReviewById(db, id) {
  try {
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/**
 * Update a review.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
async function updateReview(db, id, updates) {
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

/**
 * Delete a review by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<boolean>}
 */
async function deleteReview(db, id) {
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Get a user's existing review for a specific resource.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<object|null>}
 */
async function getUserReviewForResource(db, userId, resourceId) {
  return db.collection(COLLECTION).findOne({
    userId: new ObjectId(userId),
    resourceId: new ObjectId(resourceId),
  });
}

module.exports = {
  createIndexes,
  createReview,
  findReviewsByResource,
  findReviewById,
  updateReview,
  deleteReview,
  getUserReviewForResource,
};
