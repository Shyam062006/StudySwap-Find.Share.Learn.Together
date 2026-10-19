'use strict';

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { createReport, getUserReportForResource } = require('../models/Report');
const { findResourceById } = require('../models/Resource');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/resources/:id/reports
 * Submit a report. Body: { reason, details }
 */
async function submitReport(req, res, next) {
  try {
    const db = getDb();
    const resourceId = req.params.id;
    const { reason, details } = req.body;

    if (!reason) {
      return next(ApiError.badRequest('reason is required.'));
    }

    const resource = await findResourceById(db, resourceId);
    if (!resource) return next(ApiError.notFound('Resource not found.'));

    // Prevent duplicate reports from same user
    const existing = await getUserReportForResource(db, req.user._id, resourceId);
    if (existing) {
      return next(ApiError.conflict('You have already reported this resource.'));
    }

    const report = await createReport(db, {
      reporterId: req.user._id,
      resourceId: new ObjectId(resourceId),
      reason,
      details: details || '',
    });

    return ApiResponse.success(res, 201, 'Report submitted. Thank you.', report);
  } catch (err) {
    if (err.code === 11000) {
      return next(ApiError.conflict('You have already reported this resource.'));
    }
    next(err);
  }
}

module.exports = { submitReport };
