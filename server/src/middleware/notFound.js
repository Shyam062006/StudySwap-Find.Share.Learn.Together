'use strict';

const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware: catch all unmatched routes and return a 404 JSON response.
 */
function notFound(req, res) {
  return ApiResponse.error(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

module.exports = notFound;
