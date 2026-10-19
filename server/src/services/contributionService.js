'use strict';

const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { createTransaction, transactionExists, getUserTotalPoints } = require('../models/ContributionTransaction');
const { getAllBadges, findBadgeByName, getUserBadges, awardBadge, hasBadge } = require('../models/Badge');

// Points table for each action type
const POINTS_TABLE = {
  resource_approved: 20,
  resource_downloaded: 1,
  review_received: 5,
  helpful_rating: 2,
};

/**
 * Award points to a user for a specific action, with duplicate prevention.
 *
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {string} actionType - e.g. 'resource_approved'
 * @param {number} points - Points to award
 * @param {string|ObjectId|null} relatedResourceId
 * @param {string} uniqueRef - Unique reference string to prevent duplicate awards
 * @returns {Promise<object|null>} The created transaction, or null if duplicate
 */
async function awardPoints(db, userId, actionType, points, relatedResourceId = null, uniqueRef) {
  // Prevent duplicate awards
  const exists = await transactionExists(db, uniqueRef);
  if (exists) return null;

  const uid = typeof userId === 'string' ? new ObjectId(userId) : userId;

  const transaction = await createTransaction(db, {
    userId: uid,
    actionType,
    points,
    relatedResourceId: relatedResourceId
      ? (typeof relatedResourceId === 'string' ? new ObjectId(relatedResourceId) : relatedResourceId)
      : null,
    uniqueRef,
  });

  // Keep users collection in sync
  await db.collection('users').updateOne(
    { _id: uid },
    { $inc: { contributionPoints: points } }
  ).catch(() => {});

  // After awarding, check for new badges
  await checkAndAwardBadges(db, uid);

  return transaction;
}

/**
 * Get total contribution points for a user.
 *
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<number>}
 */
async function getUserPoints(db, userId) {
  const uid = typeof userId === 'string' ? new ObjectId(userId) : userId;
  const txPoints = await getUserTotalPoints(db, uid);
  const user = await db.collection('users').findOne({ _id: uid }, { projection: { contributionPoints: 1 } });
  return Math.max(txPoints || 0, user?.contributionPoints || 0);
}

/**
 * Check badge criteria for a user and award any new badges earned.
 *
 * Badge criteria:
 *  - first_contribution: first approved resource
 *  - knowledge_sharer: 5+ approved resources
 *  - helpful_student: 10+ reviews received on own resources
 *  - top_contributor: 100+ contribution points
 *
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 */
async function checkAndAwardBadges(db, userId) {
  const uid = typeof userId === 'string' ? new ObjectId(userId) : userId;

  const [totalPoints, transactions] = await Promise.all([
    getUserTotalPoints(db, uid),
    db.collection('contribution_transactions').find({ userId: uid }).toArray(),
  ]);

  // Count approved resources
  const approvedResourceCount = transactions.filter(
    (t) => t.actionType === 'resource_approved'
  ).length;

  // Count reviews received
  const reviewsReceivedCount = transactions.filter(
    (t) => t.actionType === 'review_received'
  ).length;

  const badgeCriteria = [
    { name: 'first_contribution', condition: approvedResourceCount >= 1 },
    { name: 'knowledge_sharer', condition: approvedResourceCount >= 5 },
    { name: 'helpful_student', condition: reviewsReceivedCount >= 10 },
    { name: 'top_contributor', condition: totalPoints >= 100 },
  ];

  for (const { name, condition } of badgeCriteria) {
    if (!condition) continue;

    const badge = await findBadgeByName(db, name);
    if (!badge) continue;

    const already = await hasBadge(db, uid, badge._id);
    if (!already) {
      await awardBadge(db, uid, badge._id);
      console.log(`[Badge] Awarded "${name}" to user ${uid}`);
    }
  }
}

module.exports = { awardPoints, getUserPoints, checkAndAwardBadges, POINTS_TABLE };
