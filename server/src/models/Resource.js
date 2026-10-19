'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'resources';

/**
 * Create required indexes for the resources collection.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ moderationStatus: 1 });
  await db.collection(COLLECTION).createIndex({ uploaderId: 1 });
  await db.collection(COLLECTION).createIndex({ subject: 1 });
  await db.collection(COLLECTION).createIndex({ branch: 1 });
  await db.collection(COLLECTION).createIndex({ semester: 1 });
  await db.collection(COLLECTION).createIndex({ createdAt: -1 });
  // Text index for search
  await db.collection(COLLECTION).createIndex(
    { title: 'text', description: 'text', subject: 'text', tags: 'text' },
    { name: 'resource_text_search' }
  );
}

/**
 * Create a new resource.
 * @param {import('mongodb').Db} db
 * @param {object} data
 * @returns {Promise<object>}
 */
async function createResource(db, data) {
  const now = new Date();
  const doc = {
    title: data.title,
    description: data.description,
    college: data.college,
    degree: data.degree,
    branch: data.branch,
    semester: parseInt(data.semester, 10),
    subject: data.subject,
    unit: data.unit || null,
    resourceType: data.resourceType,
    tags: Array.isArray(data.tags) ? data.tags : [],
    originalFilename: data.originalFilename,
    storedFilename: data.storedFilename,
    storagePath: data.storagePath,
    mimeType: data.mimeType,
    fileSize: data.fileSize,
    uploaderId: typeof data.uploaderId === 'string' ? new ObjectId(data.uploaderId) : data.uploaderId,
    moderationStatus: data.moderationStatus || 'approved',
    moderationReason: null,
    approvedBy: data.approvedBy || null,
    approvedAt: data.approvedAt || now,
    downloadCount: 0,
    averageRating: data.averageRating != null ? data.averageRating : 5,
    ratingCount: data.ratingCount != null ? data.ratingCount : 1,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Find a resource by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<object|null>}
 */
async function findResourceById(db, id) {
  try {
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/**
 * Find resources with filtering, sorting, and pagination.
 * @param {import('mongodb').Db} db
 * @param {object} filters - search, college, degree, branch, semester, subject, resourceType, minRating, moderationStatus
 * @param {object} options - page, limit, sort
 * @returns {Promise<{ resources: object[], total: number }>}
 */
async function findResources(db, filters = {}, options = {}) {
  const query = {};

  if (filters.moderationStatus) {
    if (filters.moderationStatus === 'approved' || filters.moderationStatus === 'published') {
      query.moderationStatus = { $in: ['approved', 'published'] };
    } else {
      query.moderationStatus = filters.moderationStatus;
    }
  } else if (!filters.uploaderId) {
    query.moderationStatus = { $in: ['approved', 'published'] };
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.college) query.college = { $regex: new RegExp(filters.college, 'i') };
  if (filters.degree) query.degree = { $regex: new RegExp(filters.degree, 'i') };
  if (filters.branch) query.branch = { $regex: new RegExp(filters.branch, 'i') };
  if (filters.semester) query.semester = parseInt(filters.semester, 10);
  if (filters.subject) query.subject = { $regex: new RegExp(filters.subject, 'i') };
  if (filters.resourceType) query.resourceType = filters.resourceType;
  if (filters.minRating) query.averageRating = { $gte: parseFloat(filters.minRating) };
  if (filters.uploaderId) {
    query.uploaderId = typeof filters.uploaderId === 'string'
      ? new ObjectId(filters.uploaderId)
      : filters.uploaderId;
  }

  const page = parseInt(options.page, 10) || 1;
  const limit = Math.min(parseInt(options.limit, 10) || 10, 50);
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 };
  if (options.sort === 'rating') sort = { averageRating: -1 };
  if (options.sort === 'downloads') sort = { downloadCount: -1 };
  if (options.sort === 'oldest') sort = { createdAt: 1 };
  if (filters.search) sort = { score: { $meta: 'textScore' }, ...sort };

  const [resources, total] = await Promise.all([
    db.collection(COLLECTION)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);

  return { resources, total };
}

/**
 * Update a resource by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
async function updateResource(db, id, updates) {
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

/**
 * Delete a resource by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<boolean>}
 */
async function deleteResource(db, id) {
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Find all resources by a specific uploader.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} uploaderId
 * @returns {Promise<object[]>}
 */
async function findResourcesByUploader(db, uploaderId) {
  const uid = typeof uploaderId === 'string' ? new ObjectId(uploaderId) : uploaderId;
  return db.collection(COLLECTION)
    .find({ uploaderId: uid })
    .sort({ createdAt: -1 })
    .toArray();
}

module.exports = {
  createIndexes,
  createResource,
  findResourceById,
  findResources,
  updateResource,
  deleteResource,
  findResourcesByUploader,
};
