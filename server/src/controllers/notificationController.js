'use strict';

const { getDb } = require('../config/database');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/notifications
 * Frontend expects: { data: [{ _id, message, read, createdAt, resource? }], unreadCount }
 */
async function getNotifications(req, res, next) {
  try {
    const db = getDb();
    const { page = 1, limit = 50, unreadOnly } = req.query;

    const { notifications, total } = await getUserNotifications(db, req.user._id, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });

    const unreadCount = await getUnreadCount(db, req.user._id);

    const formatted = notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      read: n.isRead !== undefined ? n.isRead : (n.read !== undefined ? n.read : false),
      resource: n.relatedResourceId || n.resource || null,
      type: n.type,
      createdAt: n.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched.',
      data: formatted,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
async function markOneAsRead(req, res, next) {
  try {
    const db = getDb();
    const updated = await markAsRead(db, req.params.id, req.user._id);

    if (!updated) {
      return next(ApiError.notFound('Notification not found.'));
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current user.
 */
async function markAllAsReadHandler(req, res, next) {
  try {
    const db = getDb();
    const count = await markAllAsRead(db, req.user._id);
    return res.status(200).json({
      success: true,
      message: `${count} notification(s) marked as read.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead: markOneAsRead, markAllAsRead: markAllAsReadHandler };
