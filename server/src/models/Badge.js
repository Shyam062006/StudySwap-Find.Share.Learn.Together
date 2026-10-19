'use strict';

const { ObjectId } = require('mongodb');

const BADGES_COLLECTION = 'badges';
const USER_BADGES_COLLECTION = 'user_badges';

/**
 * Create indexes.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(BADGES_COLLECTION).createIndex({ name: 1 }, { unique: true });
  await db.collection(USER_BADGES_COLLECTION).createIndex(
    { userId: 1, badgeId: 1 },
    { unique: true }
  );
}

/**
 * Seed default badges if they don't exist.
 * @param {import('mongodb').Db} db
 */
async function seedBadges(db) {
  const defaultBadges = [
    {
      name: 'first_contribution',
      title: 'First Contribution',
      description: 'Uploaded your first approved resource.',
      icon: '🎓',
    },
    {
      name: 'knowledge_sharer',
      title: 'Knowledge Sharer',
      description: 'Had 5 or more resources approved.',
      icon: '📚',
    },
    {
      name: 'helpful_student',
      title: 'Helpful Student',
      description: 'Received 10 or more reviews on your resources.',
      icon: '🤝',
    },
    {
      name: 'top_contributor',
      title: 'Top Contributor',
      description: 'Earned 100 or more contribution points.',
      icon: '🏆',
    },
  ];

  for (const badge of defaultBadges) {
    await db.collection(BADGES_COLLECTION).updateOne(
      { name: badge.name },
      { $setOnInsert: badge },
      { upsert: true }
    );
  }
}

/**
 * Get all badges.
 * @param {import('mongodb').Db} db
 * @returns {Promise<object[]>}
 */
async function getAllBadges(db) {
  return db.collection(BADGES_COLLECTION).find({}).toArray();
}

/**
 * Find a badge by its name.
 * @param {import('mongodb').Db} db
 * @param {string} name
 * @returns {Promise<object|null>}
 */
async function findBadgeByName(db, name) {
  return db.collection(BADGES_COLLECTION).findOne({ name });
}

/**
 * Get all badges earned by a user (with badge details).
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<object[]>}
 */
async function getUserBadges(db, userId) {
  return db.collection(USER_BADGES_COLLECTION).aggregate([
    { $match: { userId: new ObjectId(userId) } },
    {
      $lookup: {
        from: BADGES_COLLECTION,
        localField: 'badgeId',
        foreignField: '_id',
        as: 'badge',
      },
    },
    { $unwind: '$badge' },
    {
      $project: {
        earnedAt: 1,
        'badge._id': 1,
        'badge.name': 1,
        'badge.title': 1,
        'badge.description': 1,
        'badge.icon': 1,
      },
    },
    { $sort: { earnedAt: -1 } },
  ]).toArray();
}

/**
 * Award a badge to a user.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} badgeId
 * @returns {Promise<object>}
 */
async function awardBadge(db, userId, badgeId) {
  const doc = {
    userId: new ObjectId(userId),
    badgeId: new ObjectId(badgeId),
    earnedAt: new Date(),
  };
  const result = await db.collection(USER_BADGES_COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Check if a user already has a specific badge.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} badgeId
 * @returns {Promise<boolean>}
 */
async function hasBadge(db, userId, badgeId) {
  const doc = await db.collection(USER_BADGES_COLLECTION).findOne({
    userId: new ObjectId(userId),
    badgeId: new ObjectId(badgeId),
  });
  return !!doc;
}

module.exports = {
  createIndexes,
  seedBadges,
  getAllBadges,
  findBadgeByName,
  getUserBadges,
  awardBadge,
  hasBadge,
};
