'use strict';

const { ObjectId } = require('mongodb');

/**
 * Create a notification for a user.
 *
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} recipientId
 * @param {string} type - Notification type (e.g. 'resource_approved', 'new_review')
 * @param {string} title - Short notification title
 * @param {string} message - Detailed notification message
 * @param {string|ObjectId|null} relatedResourceId
 * @returns {Promise<object>} The inserted notification document
 */
async function createNotification(db, recipientId, type, title, message, relatedResourceId = null) {
  const doc = {
    recipientId: typeof recipientId === 'string' ? new ObjectId(recipientId) : recipientId,
    type,
    title,
    message,
    relatedResourceId: relatedResourceId
      ? (typeof relatedResourceId === 'string' ? new ObjectId(relatedResourceId) : relatedResourceId)
      : null,
    isRead: false,
    createdAt: new Date(),
  };

  const result = await db.collection('notifications').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

module.exports = { createNotification };
