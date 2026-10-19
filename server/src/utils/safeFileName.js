'use strict';

const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a safe, unique filename to prevent path traversal attacks.
 * Format: <timestamp>-<uuid>.<sanitized-extension>
 *
 * @param {string} originalName - The original filename from the upload
 * @returns {string} A safe unique filename
 */
function safeFileName(originalName) {
  // Extract and sanitize the extension
  const rawExt = path.extname(originalName || '').toLowerCase();

  // Whitelist of allowed extensions
  const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const safeExt = allowedExtensions.includes(rawExt) ? rawExt : '';

  const timestamp = Date.now();
  const unique = uuidv4().replace(/-/g, '');

  return `${timestamp}-${unique}${safeExt}`;
}

module.exports = safeFileName;
