'use strict';

/**
 * Standardized JSON response helper.
 * Always returns: { success, message, data?, pagination? }
 */
class ApiResponse {
  /**
   * Send a success response.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*} data
   * @param {object|null} pagination
   */
  static success(res, statusCode = 200, message = 'Success', data = null, pagination = null) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (pagination !== null) body.pagination = pagination;
    return res.status(statusCode).json(body);
  }

  /**
   * Send an error response.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*} errors
   */
  static error(res, statusCode = 500, message = 'Error', errors = null) {
    const body = { success: false, message };
    if (errors !== null) body.errors = errors;
    return res.status(statusCode).json(body);
  }

  /**
   * Build a pagination metadata object.
   * @param {number} total - Total documents matching query
   * @param {number} page - Current page (1-based)
   * @param {number} limit - Items per page
   */
  static buildPagination(total, page, limit) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

module.exports = ApiResponse;
