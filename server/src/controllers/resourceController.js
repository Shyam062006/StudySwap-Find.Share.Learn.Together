'use strict';

const path = require('path');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const {
  createResource,
  findResourceById,
  findResources,
  updateResource,
  deleteResource,
  findResourcesByUploader,
} = require('../models/Resource');
const { recordDownload } = require('../models/Download');
const { isBookmarked } = require('../models/Bookmark');
const { getUserRating } = require('../models/Rating');
const { deleteFile, getFilePath } = require('../services/storageService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Enrich a resource with uploader info, bookmark status, user rating.
 */
async function enrichResource(db, resource, userId) {
  if (!resource) return null;

  // Get uploader name
  const uploader = await db.collection('users').findOne(
    { _id: resource.uploaderId },
    { projection: { name: 1 } }
  );

  const enriched = {
    ...resource,
    // Map moderationStatus -> status for frontend compatibility
    status: resource.moderationStatus || resource.status || 'pending',
    rejectionReason: resource.moderationReason || null,
    uploader: uploader ? { _id: uploader._id, name: uploader.name } : { _id: resource.uploaderId, name: 'Unknown' },
    fileType: resource.originalFilename && path.extname(resource.originalFilename)
      ? path.extname(resource.originalFilename).replace('.', '').toUpperCase()
      : (resource.mimeType?.includes('pdf') ? 'PDF'
        : resource.mimeType?.includes('word') ? 'DOCX'
        : resource.mimeType?.includes('presentation') ? 'PPTX'
        : resource.mimeType?.includes('png') ? 'PNG'
        : resource.mimeType?.includes('jpeg') ? 'JPG'
        : (resource.mimeType || 'PDF').split('/').pop().toUpperCase()),
  };

  // Add bookmark + rating info for authenticated user
  if (userId) {
    try {
      const uid = typeof userId === 'string' ? new ObjectId(userId) : userId;
      enriched.isBookmarked = await isBookmarked(db, uid, resource._id);
      const userRating = await getUserRating(db, uid, resource._id);
      enriched.myRating = userRating ? userRating.rating : null;
    } catch {
      enriched.isBookmarked = false;
      enriched.myRating = null;
    }
  }

  return enriched;
}

/**
 * Optionally extract user from cookie without requiring auth.
 * Used for public endpoints that optionally enrich data.
 */
function getOptionalUserId(req) {
  if (req.user && req.user._id) return req.user._id;
  // Try extracting from token if authenticate middleware wasn't used
  try {
    const jwt = require('jsonwebtoken');
    const config = require('../config/environment');
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded.id;
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * GET /api/resources
 * Public. List approved resources with filtering and pagination.
 * Frontend sends: q, college, degree, branch, semester, subject, unit, resourceType, rating, sort, page, limit
 */
async function getResources(req, res, next) {
  try {
    const db = getDb();
    const {
      q, search, college, degree, branch, semester, subject, unit,
      resourceType, rating, minRating, sort, page = 1, limit = 12,
    } = req.query;

    const filters = {
      moderationStatus: 'approved',
      search: q || search || undefined,
      college, degree, branch, semester, subject, unit, resourceType,
      minRating: rating || minRating || undefined,
    };

    // Map sort values from frontend
    let sortKey = sort;
    if (sort === 'recent') sortKey = undefined; // default is createdAt desc
    if (sort === 'relevant' && (q || search)) sortKey = undefined; // text score

    const { resources, total } = await findResources(db, filters, {
      page, limit, sort: sortKey,
    });

    // Enrich resources with uploader info
    const userId = getOptionalUserId(req);
    const enriched = await Promise.all(resources.map(r => enrichResource(db, r, userId)));

    const pagination = ApiResponse.buildPagination(total, parseInt(page), parseInt(limit));
    return ApiResponse.success(res, 200, 'Resources fetched.', enriched, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/resources/:id
 */
async function getResourceById(req, res, next) {
  try {
    const db = getDb();
    const resource = await findResourceById(db, req.params.id);

    if (!resource) {
      return next(ApiError.notFound('Resource not found.'));
    }

    const userId = getOptionalUserId(req);
    const isOwner = userId &&
      resource.uploaderId.toString() === userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // Allow published, or own resource, or admin
    if (resource.moderationStatus !== 'approved' &&
        resource.moderationStatus !== 'published' &&
        !isOwner && !isAdmin) {
      return next(ApiError.notFound('Resource not found.'));
    }

    const enriched = await enrichResource(db, resource, userId);
    return ApiResponse.success(res, 200, 'Resource fetched.', enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/resources
 * Authenticated. Upload a new resource (status = pending).
 */
async function createResourceHandler(req, res, next) {
  try {
    const db = getDb();

    if (!req.file) {
      return next(ApiError.badRequest('A file must be uploaded.'));
    }

    const { title, description, college, degree, branch, semester, subject, unit, resourceType, tags } = req.body;

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : []);
      } catch {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
    }

    const resource = await createResource(db, {
      title,
      description,
      college,
      degree,
      branch,
      semester,
      subject,
      unit,
      resourceType,
      tags: parsedTags,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      storagePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploaderId: req.user._id,
      moderationStatus: 'approved',
      approvedAt: new Date(),
    });

    // Award contribution points to student immediately
    try {
      const { awardPoints } = require('../services/contributionService');
      await awardPoints(db, req.user._id, 'resource_approved', 20, resource._id, `upload_${resource._id}`);
    } catch { /* ignore */ }

    const enriched = await enrichResource(db, resource, req.user._id);
    return ApiResponse.success(res, 201, 'Resource shared successfully! Available immediately in the Material Hub.', enriched);
  } catch (err) {
    if (req.file) await deleteFile(req.file.path).catch(() => {});
    next(err);
  }
}

/**
 * PATCH /api/resources/:id
 */
async function updateResourceHandler(req, res, next) {
  try {
    const db = getDb();
    const resource = await findResourceById(db, req.params.id);

    if (!resource) return next(ApiError.notFound('Resource not found.'));

    const isOwner = resource.uploaderId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(ApiError.forbidden('You do not have permission to update this resource.'));
    }

    const allowedFields = ['title', 'description', 'college', 'degree', 'branch', 'semester', 'subject', 'unit', 'resourceType', 'tags'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await updateResource(db, req.params.id, updates);
    const enriched = await enrichResource(db, updated, req.user._id);
    return ApiResponse.success(res, 200, 'Resource updated.', enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/resources/:id
 */
async function deleteResourceHandler(req, res, next) {
  try {
    const db = getDb();
    const resource = await findResourceById(db, req.params.id);

    if (!resource) return next(ApiError.notFound('Resource not found.'));

    const isOwner = resource.uploaderId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(ApiError.forbidden('You do not have permission to delete this resource.'));
    }

    await deleteResource(db, req.params.id);
    await deleteFile(resource.storagePath).catch(() => {});

    return ApiResponse.success(res, 200, 'Resource deleted successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/resources/:id/download
 * Authenticated. Send the actual file.
 */
async function downloadResource(req, res, next) {
  try {
    const db = getDb();
    const resource = await findResourceById(db, req.params.id);

    if (!resource) return next(ApiError.notFound('Resource not found.'));
    if (resource.moderationStatus !== 'approved' && resource.moderationStatus !== 'published') {
      return next(ApiError.forbidden('This resource is not available for download.'));
    }

    const filePath = getFilePath(resource.storedFilename);

    // Record download and increment count asynchronously
    recordDownload(db, req.user._id, resource._id).catch(() => {});
    updateResource(db, resource._id.toString(), {
      downloadCount: (resource.downloadCount || 0) + 1,
    }).catch(() => {});

    return res.download(filePath, resource.originalFilename, (err) => {
      if (err && !res.headersSent) {
        next(ApiError.internal('Failed to send file.'));
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/me/resources
 * Authenticated. Return all resources uploaded by the current user.
 */
async function getMyResources(req, res, next) {
  try {
    const db = getDb();
    const { page = 1, limit = 20 } = req.query;

    const filters = { uploaderId: req.user._id };
    const { resources, total } = await findResources(db, filters, {
      page, limit, sort: undefined,
    });

    const enriched = await Promise.all(resources.map(r => enrichResource(db, r, req.user._id)));
    const pagination = ApiResponse.buildPagination(total, parseInt(page), parseInt(limit));
    return ApiResponse.success(res, 200, 'Your resources.', enriched, pagination);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getResources,
  getResourceById,
  createResource: createResourceHandler,
  updateResource: updateResourceHandler,
  deleteResource: deleteResourceHandler,
  downloadResource,
  getMyResources,
};
