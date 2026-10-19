'use strict';

const { ObjectId } = require('mongodb');

const COLLECTION = 'users';

/**
 * Create required indexes for the users collection.
 * @param {import('mongodb').Db} db
 */
async function createIndexes(db) {
  await db.collection(COLLECTION).createIndex({ email: 1 }, { unique: true });
  await db.collection(COLLECTION).createIndex({ createdAt: 1 });
}

/**
 * Create a new user.
 * @param {import('mongodb').Db} db
 * @param {object} userData
 * @returns {Promise<object>} The inserted user document
 */
async function createUser(db, userData) {
  const now = new Date();
  const doc = {
    name: userData.name,
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash,
    role: userData.role || 'student',
    college: userData.college,
    degree: userData.degree,
    branch: userData.branch,
    semester: parseInt(userData.semester, 10),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Find a user by email.
 * @param {import('mongodb').Db} db
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findUserByEmail(db, email) {
  return db.collection(COLLECTION).findOne({ email: email.toLowerCase().trim() });
}

/**
 * Find a user by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<object|null>}
 */
async function findUserById(db, id) {
  try {
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

/**
 * Update a user by ID.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @param {object} updates
 * @returns {Promise<object|null>} The updated document
 */
async function updateUser(db, id, updates) {
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

/**
 * Get all users with optional filtering and pagination.
 * @param {import('mongodb').Db} db
 * @param {object} query - MongoDB filter
 * @param {object} options - { page, limit, sort }
 * @returns {Promise<{ users: object[], total: number }>}
 */
async function getAllUsers(db, query = {}, options = {}) {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  const [users, total] = await Promise.all([
    db.collection(COLLECTION)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .project({ passwordHash: 0 })
      .toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);

  return { users, total };
}

/**
 * Toggle a user's isActive status.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} id
 * @returns {Promise<object|null>} The updated document
 */
async function toggleUserStatus(db, id) {
  const user = await findUserById(db, id);
  if (!user) return null;

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isActive: !user.isActive, updatedAt: new Date() } },
    { returnDocument: 'after', projection: { passwordHash: 0 } }
  );
  return result;
}

module.exports = {
  createIndexes,
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsers,
  toggleUserStatus,
};
