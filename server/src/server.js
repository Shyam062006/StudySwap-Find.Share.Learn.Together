'use strict';

require('dotenv/config');

const app = require('./app');
const config = require('./config/environment');
const { connectDB } = require('./config/database');
const { createIndexes: createBadgeIndexes, seedBadges } = require('./models/Badge');

async function startServer() {
  try {
    // Connect to MongoDB
    const db = await connectDB();
    console.log('[Server] MongoDB connected successfully.');

    // Initialize default badges and indexes
    await createBadgeIndexes(db);
    await seedBadges(db);

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`[Server] StudySwap API running on port ${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
      console.log(`[Server] Client URL: ${config.client.url}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
