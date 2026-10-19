'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'contribution_transactions';

/**
 * Create indexes for contribution transactions.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ userId: 1 });
  await db.collection(COLLECTION).createIndex({ uniqueRef: 1 }, { unique: true });
  await db.collection(COLLECTION).createIndex({ createdAt: -1 });
}

/**
 * Create a new contribution transaction.
 * @param {import('mongodb').Db} db
 * @param {object} data - { userId, actionType, points, relatedResourceId, uniqueRef }
 * @returns {Promise<object>}
 */
async function createTransaction(db, data) {
  const doc = {
    userId: new ObjectId(data.userId),
    actionType: data.actionType,
    points: data.points,
    relatedResourceId: data.relatedResourceId ? new ObjectId(data.relatedResourceId) : null,
    uniqueRef: data.uniqueRef,
    createdAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Get all contribution transactions for a user.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<object[]>}
 */
async function getUserTransactions(db, userId) {
  return db.collection(COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Get the total contribution points for a user.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<number>}
 */
async function getUserTotalPoints(db, userId) {
  const [result] = await db.collection(COLLECTION).aggregate([
    { $match: { userId: new ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$points' } } },
  ]).toArray();

  return result ? result.total : 0;
}

/**
 * Check if a transaction with a given uniqueRef already exists (duplicate prevention).
 * @param {import('mongodb').Db} db
 * @param {string} uniqueRef
 * @returns {Promise<boolean>}
 */
async function transactionExists(db, uniqueRef) {
  const doc = await db.collection(COLLECTION).findOne({ uniqueRef });
  return !!doc;
}

module.exports = {
  createIndexes,
  createTransaction,
  getUserTransactions,
  getUserTotalPoints,
  transactionExists,
};
