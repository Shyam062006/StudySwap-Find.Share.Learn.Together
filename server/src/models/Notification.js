'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'notifications';

/**
 * Create indexes for the notifications collection.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ recipientId: 1 });
  await db.collection(COLLECTION).createIndex({ createdAt: -1 });
  await db.collection(COLLECTION).createIndex({ isRead: 1 });
}

/**
 * Create a notification.
 * @param {import('mongodb').Db} db
 * @param {object} data
 * @returns {Promise<object>}
 */
async function createNotification(db, data) {
  const doc = {
    recipientId: new ObjectId(data.recipientId),
    type: data.type,
    title: data.title,
    message: data.message,
    relatedResourceId: data.relatedResourceId ? new ObjectId(data.relatedResourceId) : null,
    isRead: false,
    createdAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Get notifications for a user with pagination.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @param {object} options - { page, limit, unreadOnly }
 * @returns {Promise<{ notifications: object[], total: number }>}
 */
async function getUserNotifications(db, userId, options = {}) {
  const query = { recipientId: new ObjectId(userId) };
  if (options.unreadOnly) query.isRead = false;

  const page = parseInt(options.page, 10) || 1;
  const limit = Math.min(parseInt(options.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    db.collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);

  return { notifications, total };
}

/**
 * Mark a single notification as read.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} notificationId
 * @param {string|ObjectId} userId - To ensure ownership
 * @returns {Promise<boolean>}
 */
async function markAsRead(db, notificationId, userId) {
  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(notificationId), recipientId: new ObjectId(userId) },
    { $set: { isRead: true } }
  );
  return result.modifiedCount === 1;
}

/**
 * Mark all notifications for a user as read.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<number>} Count of modified documents
 */
async function markAllAsRead(db, userId) {
  const result = await db.collection(COLLECTION).updateMany(
    { recipientId: new ObjectId(userId), isRead: false },
    { $set: { isRead: true } }
  );
  return result.modifiedCount;
}

/**
 * Get unread notification count for a user.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} userId
 * @returns {Promise<number>}
 */
async function getUnreadCount(db, userId) {
  return db.collection(COLLECTION).countDocuments({
    recipientId: new ObjectId(userId),
    isRead: false,
  });
}

module.exports = {
  createIndexes,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
