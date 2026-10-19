'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'reports';

/**
 * Create indexes for the reports collection.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ resourceId: 1 });
  await db.collection(COLLECTION).createIndex({ reporterId: 1 });
  await db.collection(COLLECTION).createIndex({ status: 1 });
  // Prevent duplicate reports per user+resource
  await db.collection(COLLECTION).createIndex(
    { reporterId: 1, resourceId: 1 },
    { unique: true }
  );
}

/**
 * Create a new report.
 * @param {import('mongodb').Db} db
 * @param {object} data - { reporterId, resourceId, reason, details }
 * @returns {Promise<object>}
 */
async function createReport(db, data) {
  const now = new Date();
  const doc = {
    reporterId: new ObjectId(data.reporterId),
    resourceId: new ObjectId(data.resourceId),
    reason: data.reason,
    details: data.details || null,
    status: 'pending', // pending | reviewed | dismissed
    reviewedBy: null,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Find all reports with optional filters and pagination.
 * @param {import('mongodb').Db} db
 * @param {object} filters
 * @param {object} options - { page, limit }
 * @returns {Promise<{ reports: object[], total: number }>}
 */
async function findReports(db, filters = {}, options = {}) {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.resourceId) query.resourceId = new ObjectId(filters.resourceId);

  const page = parseInt(options.page, 10) || 1;
  const limit = Math.min(parseInt(options.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'resources',
        localField: 'resourceId',
        foreignField: '_id',
        as: 'resource',
      },
    },
    { $unwind: { path: '$resource', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'reporterId',
        foreignField: '_id',
        as: 'reporter',
      },
    },
    { $unwind: { path: '$reporter', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        reason: 1,
        details: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        reviewedAt: 1,
        'resource._id': 1,
        'resource.title': 1,
        'reporter._id': 1,
        'reporter.name': 1,
        'reporter.email': 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [reports, total] = await Promise.all([
    db.collection(COLLECTION).aggregate(pipeline).toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);

  return { reports, total };
}

/**
 * Find a report by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<object|null>}
 */
async function findReportById(db, id) {
  try {
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/**
 * Update a report's status.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @param {object} updates - { status, reviewedBy }
 * @returns {Promise<object|null>}
 */
async function updateReportStatus(db, id, updates) {
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, reviewedAt: new Date(), updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

/**
 * Get the existing report by a user for a specific resource.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} reporterId
 * @param {string|ObjectId} resourceId
 * @returns {Promise<object|null>}
 */
async function getUserReportForResource(db, reporterId, resourceId) {
  return db.collection(COLLECTION).findOne({
    reporterId: new ObjectId(reporterId),
    resourceId: new ObjectId(resourceId),
  });
}

module.exports = {
  createIndexes,
  createReport,
  findReports,
  findReportById,
  updateReportStatus,
  getUserReportForResource,
};
