'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const safeFileName = require('../utils/safeFileName');
const config = require('../config/environment');
const ApiError = require('../utils/ApiError');

// Allowed MIME types
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

// Allowed extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

/**
 * Validate file magic bytes (signatures) to prevent extension spoofing.
 * Reads first 8 bytes of the stored file and compares against known signatures.
 */
function validateMagicBytes(filepath, mimetype) {
  const SIGNATURES = {
    'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]),              // %PDF
    'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // \x89PNG\r\n\x1a\n
    'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]),                          // JFIF / EXIF
  };

  const sig = SIGNATURES[mimetype];
  if (!sig) return true; // Office docs don't have a simple magic byte check; skip

  const fd = fs.openSync(filepath, 'r');
  const buf = Buffer.alloc(8);
  fs.readSync(fd, buf, 0, 8, 0);
  fs.closeSync(fd);

  return buf.slice(0, sig.length).equals(sig);
}

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, safeFileName(file.originalname));
  },
});

// File filter based on extension + mimetype
function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(
      new ApiError(400, `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`),
      false
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMb * 1024 * 1024,
  },
});

/**
 * Middleware wrapper that validates magic bytes AFTER multer stores the file.
 * Deletes the file and returns 400 if content doesn't match declared type.
 */
function uploadAndValidate(fieldName) {
  return [
    upload.single(fieldName),
    (req, res, next) => {
      if (!req.file) return next();

      const isValid = validateMagicBytes(req.file.path, req.file.mimetype);
      if (!isValid) {
        // Delete the bad file
        fs.unlink(req.file.path, () => {});
        return next(new ApiError(400, 'File content does not match its declared type.'));
      }

      next();
    },
  ];
}

module.exports = { upload, uploadAndValidate };
