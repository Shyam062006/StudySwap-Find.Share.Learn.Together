'use strict';

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware: run express-validator result check.
 * Returns 422 with a structured errors array if any validations failed.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const formatted = errorList.map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    const firstMsg = errorList[0]?.msg;
    return ApiResponse.error(res, 422, firstMsg ? `Validation failed: ${firstMsg}` : 'Validation failed.', formatted);
  }

  next();
}

module.exports = validateRequest;
