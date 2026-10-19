'use strict';

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { getAllUsers, findUserById, updateUser } = require('../models/User');
const { findResources, findResourceById, updateResource } = require('../models/Resource');
const { findReports, findReportById, updateReportStatus } = require('../models/Report');
const { awardPoints } = require('../services/contributionService');
const { createNotification } = require('../services/notificationService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/admin/stats
 * Frontend expects: { totalUsers, totalResources, pendingResources, publishedResources, openReports, totalDownloads }
 */
async function getStats(req, res, next) {
  try {
    const db = getDb();

    const [
      totalUsers,
      totalResources,
      pendingResources,
      publishedResources,
      totalDownloads,
      openReports,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('resources').countDocuments(),
      db.collection('resources').countDocuments({ moderationStatus: 'pending' }),
      db.collection('resources').countDocuments({ moderationStatus: { $in: ['approved', 'published'] } }),
      db.collection('resources').aggregate([
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]).toArray().then(r => r[0]?.total || 0),
      db.collection('reports').countDocuments({ status: { $in: ['open', 'pending'] } }),
    ]);

    return ApiResponse.success(res, 200, 'Stats fetched.', {
      totalUsers,
      totalResources,
      pendingResources,
      publishedResources,
      openReports,
      totalDownloads,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/resources/pending
 */
async function getPendingResources(req, res, next) {
  try {
    const db = getDb();
    const { page = 1, limit = 20 } = req.query;

    const { resources, total } = await findResources(
      db,
      { moderationStatus: 'pending' },
      { page, limit }
    );

    // Enrich with uploader info
    const enriched = await Promise.all(resources.map(async (r) => {
      const uploader = await db.collection('users').findOne(
        { _id: r.uploaderId },
        { projection: { name: 1 } }
      );
      return {
        ...r,
        status: r.moderationStatus,
        fileType: r.mimeType,
        uploader: uploader ? { _id: uploader._id, name: uploader.name } : { _id: r.uploaderId, name: 'Unknown' },
      };
    }));

    const pagination = ApiResponse.buildPagination(total, parseInt(page), parseInt(limit));
    return ApiResponse.success(res, 200, 'Pending resources fetched.', enriched, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/resources/:id/moderation
 * Body: { status: "approved"|"rejected", reason? }
 */
async function moderateResource(req, res, next) {
  try {
    const db = getDb();
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(ApiError.badRequest('status must be "approved" or "rejected".'));
    }

    const resource = await findResourceById(db, req.params.id);
    if (!resource) return next(ApiError.notFound('Resource not found.'));

    if (resource.moderationStatus !== 'pending') {
      return next(ApiError.conflict('This resource has already been moderated.'));
    }

    const updates = {
      moderationStatus: status === 'approved' ? 'approved' : 'rejected',
      moderationReason: reason || null,
      approvedBy: status === 'approved' ? new ObjectId(req.user._id) : null,
      approvedAt: status === 'approved' ? new Date() : null,
    };

    const updated = await updateResource(db, req.params.id, updates);

    if (status === 'approved') {
      // Award contribution points
      const ref = `resource_approved:${resource._id}`;
      await awardPoints(db, resource.uploaderId, 'resource_approved', 10, resource._id, ref).catch(() => {});

      await createNotification(
        db, resource.uploaderId, 'resource_approved',
        'Resource Approved!',
        `Your resource "${resource.title}" has been approved and is now live in the Material Hub.`,
        resource._id
      ).catch(() => {});
    } else {
      await createNotification(
        db, resource.uploaderId, 'resource_rejected',
        'Resource Not Approved',
        `Your resource "${resource.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
        resource._id
      ).catch(() => {});
    }

    // Return enriched resource
    const uploader = await db.collection('users').findOne(
      { _id: resource.uploaderId },
      { projection: { name: 1 } }
    );

    return ApiResponse.success(res, 200, `Resource ${status} successfully.`, {
      ...updated,
      status: updated.moderationStatus,
      uploader: uploader ? { _id: uploader._id, name: uploader.name } : { _id: resource.uploaderId, name: 'Unknown' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/reports
 * Frontend expects: [{ _id, resource: { _id, title }, reporter: { name }, reason, details, status, createdAt }]
 */
async function getReports(req, res, next) {
  try {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      db.collection('reports')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('reports').countDocuments(query),
    ]);

    // Enrich with resource + reporter info
    const enriched = await Promise.all(reports.map(async (r) => {
      const [resource, reporter] = await Promise.all([
        db.collection('resources').findOne({ _id: r.resourceId }, { projection: { title: 1 } }),
        db.collection('users').findOne({ _id: r.reporterId }, { projection: { name: 1 } }),
      ]);

      return {
        _id: r._id,
        resource: resource ? { _id: resource._id, title: resource.title } : { _id: r.resourceId, title: 'Deleted Resource' },
        reporter: reporter ? { name: reporter.name } : { name: 'Unknown' },
        reason: r.reason,
        details: r.details || r.description || '',
        status: r.status || 'open',
        createdAt: r.createdAt,
      };
    }));

    const pagination = ApiResponse.buildPagination(total, pageNum, limitNum);
    return ApiResponse.success(res, 200, 'Reports fetched.', enriched, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reports/:id
 * Body: { status: "resolved" }
 */
async function updateReport(req, res, next) {
  try {
    const db = getDb();
    const { status } = req.body;

    if (!['resolved', 'dismissed', 'reviewed', 'open'].includes(status)) {
      return next(ApiError.badRequest('Invalid status.'));
    }

    const report = await findReportById(db, req.params.id);
    if (!report) return next(ApiError.notFound('Report not found.'));

    const updated = await updateReportStatus(db, req.params.id, {
      status,
      reviewedBy: new ObjectId(req.user._id),
    });

    return ApiResponse.success(res, 200, 'Report updated.', updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 */
async function getUsers(req, res, next) {
  try {
    const db = getDb();
    const { page = 1, limit = 20, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { email: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const { users, total } = await getAllUsers(db, query, { page, limit });

    // Add status field and remove passwordHash
    const safeUsers = users.map(({ passwordHash, ...u }) => ({
      ...u,
      status: u.isActive === false ? 'restricted' : 'active',
    }));

    const pagination = ApiResponse.buildPagination(total, parseInt(page), parseInt(limit));
    return ApiResponse.success(res, 200, 'Users fetched.', safeUsers, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:id/status
 * Body: { status: "active"|"restricted" }
 */
async function updateUserStatus(req, res, next) {
  try {
    const db = getDb();
    const { status } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return next(ApiError.forbidden('You cannot change your own status.'));
    }

    const user = await findUserById(db, req.params.id);
    if (!user) return next(ApiError.notFound('User not found.'));

    const isActive = status === 'active';
    const updated = await updateUser(db, req.params.id, { isActive });
    if (!updated) return next(ApiError.notFound('User not found.'));

    const { passwordHash, ...safeUser } = updated;

    return ApiResponse.success(res, 200,
      `User has been ${isActive ? 'activated' : 'restricted'}.`,
      { ...safeUser, status: isActive ? 'active' : 'restricted' }
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getPendingResources,
  moderateResource,
  getReports,
  updateReport,
  getUsers,
  updateUserStatus,
};
