'use strict';

/**
 * Central environment configuration.
 * All process.env access should go through this module.
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyswap',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production_min_64_chars_long_string_here',
    expiresIn: '7d',
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 20,
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  },
};

module.exports = config;
