'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { connectDB, closeDatabaseConnection } = require('../src/config/database');
const { createIndexes: createBadgeIndexes, seedBadges } = require('../src/models/Badge');

let mongod = null;
let client = null;

async function setupTestDB() {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test_jwt_secret_key_long_enough_for_security_testing_purposes_12345';
    process.env.COOKIE_SECURE = 'false';

    const db = await connectDB(uri);
    await createBadgeIndexes(db);
    await seedBadges(db);
    return db;
  } catch (err) {
    console.error('Failed to start test DB:', err);
    throw err;
  }
}

async function teardownTestDB() {
  try {
    await closeDatabaseConnection();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Failed to teardown test DB:', err);
  }
}

async function clearTestDB(db) {
  if (!db) return;
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    if (col.name !== 'badges') {
      await db.collection(col.name).deleteMany({});
    }
  }
}

module.exports = { setupTestDB, teardownTestDB, clearTestDB };
