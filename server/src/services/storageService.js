'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config/environment');

/**
 * Resolve the absolute path for a stored filename.
 * Prevents path traversal by using path.basename.
 *
 * @param {string} storedFilename - The filename stored in the DB
 * @returns {string} Absolute path to the file
 */
function getFilePath(storedFilename) {
  const safeBasename = path.basename(storedFilename);
  return path.resolve(process.cwd(), config.upload.dir, safeBasename);
}

/**
 * Delete an uploaded file from disk safely.
 * Fails silently if the file does not exist.
 *
 * @param {string} filepath - Absolute path to the file to delete
 * @returns {Promise<void>}
 */
async function deleteFile(filepath) {
  return new Promise((resolve) => {
    if (!filepath) return resolve();

    const safePath = path.resolve(filepath);
    const uploadDir = path.resolve(process.cwd(), config.upload.dir);

    // Security: ensure the path is within the uploads directory
    if (!safePath.startsWith(uploadDir)) {
      console.warn('[Storage] Attempted to delete file outside uploads directory:', safePath);
      return resolve();
    }

    fs.unlink(safePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.warn('[Storage] Could not delete file:', safePath, err.message);
      }
      resolve();
    });
  });
}

module.exports = { getFilePath, deleteFile };
