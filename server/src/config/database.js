'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { MongoClient } = require('mongodb');
const config = require('./environment');

let client = null;
let db = null;
let spawnedMongoProcess = null;

/**
 * Attempt to auto-start local mongod if port 27017 is refused.
 */
async function tryStartLocalMongo(uri) {
  if (!uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    return false;
  }

  try {
    const { MongoBinary } = require('mongodb-memory-server');
    const binary = await MongoBinary.getPath();
    const dbPath = path.resolve(__dirname, '../../data/db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    console.log('[DB] Launching local MongoDB engine at:', dbPath);
    spawnedMongoProcess = spawn(binary, [
      '--dbpath', dbPath,
      '--port', '27017',
      '--bind_ip', '127.0.0.1',
    ], { stdio: 'ignore' });

    // Give it 1.2s to initialize
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return true;
  } catch (err) {
    console.warn('[DB] Could not auto-start local MongoDB:', err.message);
    return false;
  }
}

/**
 * Connect to MongoDB and store the db instance.
 */
async function connectDB(customUri = null) {
  if (db) return db;

  const uri = customUri || process.env.MONGODB_URI || config.mongodb.uri;

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    await client.connect();
  } catch (firstErr) {
    // If local connection was refused, try auto-launching local engine
    if (firstErr.message && (firstErr.message.includes('ECONNREFUSED') || firstErr.message.includes('ServerSelection'))) {
      const started = await tryStartLocalMongo(uri);
      if (started) {
        client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
      } else {
        throw firstErr;
      }
    } else {
      throw firstErr;
    }
  }

  db = client.db();
  console.log(`[DB] Connected to MongoDB: ${client.options.hosts}`);

  process.on('SIGINT', closeDatabaseConnection);
  process.on('SIGTERM', closeDatabaseConnection);

  return db;
}

/**
 * Return the cached database instance.
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * Close the MongoDB connection gracefully.
 */
async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('[DB] MongoDB connection closed.');
  }

  if (spawnedMongoProcess) {
    try {
      spawnedMongoProcess.kill('SIGINT');
      spawnedMongoProcess = null;
      console.log('[DB] Local MongoDB engine terminated.');
    } catch { /* ignore */ }
  }
}

module.exports = { connectDB, getDb, closeDatabaseConnection };
