'use strict';

const { getDb } = require('../config/database');
const { addBookmark, removeBookmark, getUserBookmarks, isBookmarked } = require('../models/Bookmark');
const { findResourceById } = require('../models/Resource');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/bookmarks
 * Get all bookmarks for the current user. Returns array of resource objects.
 */
async function getBookmarks(req, res, next) {
  try {
    const db = getDb();
    const bookmarks = await getUserBookmarks(db, req.user._id);

    // bookmarks contains [{ _id, createdAt, resource: {...} }]
    // Enrich each resource so it has uploader name, status, and isBookmarked: true
    const resources = await Promise.all(
      bookmarks
        .filter((b) => b.resource)
        .map(async (b) => {
          const r = b.resource;
          const uploader = await db.collection('users').findOne(
            { _id: r.uploaderId },
            { projection: { name: 1 } }
          );
          return {
            ...r,
            status: r.moderationStatus || r.status || 'approved',
            fileType: r.mimeType,
            uploader: uploader ? { _id: uploader._id, name: uploader.name } : { _id: r.uploaderId, name: 'Unknown' },
            isBookmarked: true,
          };
        })
    );

    return ApiResponse.success(res, 200, 'Bookmarks fetched.', resources);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookmarks/:resourceId
 * Add a bookmark. Handles resourceId from params or body.
 */
async function addBookmarkHandler(req, res, next) {
  try {
    const db = getDb();
    const resourceId = req.params.resourceId || req.body.resourceId;

    if (!resourceId) {
      return next(ApiError.badRequest('resourceId is required.'));
    }

    // Check resource exists and is approved or published
    const resource = await findResourceById(db, resourceId);
    if (!resource || (resource.moderationStatus !== 'approved' && resource.moderationStatus !== 'published')) {
      return next(ApiError.notFound('Resource not found.'));
    }

    // Prevent duplicate
    const already = await isBookmarked(db, req.user._id, resourceId);
    if (already) {
      return ApiResponse.success(res, 200, 'Resource is already bookmarked.');
    }

    const bookmark = await addBookmark(db, req.user._id, resourceId);
    return ApiResponse.success(res, 201, 'Bookmark added.', bookmark);
  } catch (err) {
    if (err.code === 11000) {
      return ApiResponse.success(res, 200, 'Resource is already bookmarked.');
    }
    next(err);
  }
}

/**
 * DELETE /api/bookmarks/:resourceId
 * Remove a bookmark.
 */
async function removeBookmarkHandler(req, res, next) {
  try {
    const db = getDb();
    const resourceId = req.params.resourceId || req.body.resourceId;
    const removed = await removeBookmark(db, req.user._id, resourceId);

    if (!removed) {
      return next(ApiError.notFound('Bookmark not found.'));
    }

    return ApiResponse.success(res, 200, 'Bookmark removed.');
  } catch (err) {
    next(err);
  }
}

module.exports = { getBookmarks, addBookmark: addBookmarkHandler, removeBookmark: removeBookmarkHandler };
