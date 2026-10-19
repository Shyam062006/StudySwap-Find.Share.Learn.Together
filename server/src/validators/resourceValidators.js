'use strict';

const { body } = require('express-validator');

const RESOURCE_TYPES = [
  'Lecture Notes',
  'Previous Papers',
  'Lab Manual',
  'Lab Record',
  'Question Bank',
  'Presentation',
  'Study Guide',
  'Reference',
  'notes',
  'previous_papers',
  'previousPaper',
  'previousPapers',
  'lab_programs',
  'labPrograms',
  'lab_manual',
  'labManual',
  'lab_record',
  'labRecord',
  'question_bank',
  'questionBank',
  'presentation',
  'study_guide',
  'studyGuide',
  'reference',
  'other',
];

/**
 * Validation rules for POST /api/resources (create resource)
 */
const createResourceValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1 and 2000 characters.'),

  body('college')
    .trim()
    .notEmpty().withMessage('College is required.')
    .isLength({ min: 1, max: 200 }).withMessage('College name must be between 1 and 200 characters.'),

  body('degree')
    .trim()
    .notEmpty().withMessage('Degree is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Degree must be between 1 and 100 characters.'),

  body('branch')
    .trim()
    .notEmpty().withMessage('Branch is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Branch must be between 1 and 100 characters.'),

  body('semester')
    .notEmpty().withMessage('Semester is required.')
    .isInt({ min: 1, max: 8 }).withMessage('Semester must be an integer between 1 and 8.')
    .toInt(),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required.')
    .isLength({ min: 1, max: 200 }).withMessage('Subject must be between 1 and 200 characters.'),

  body('resourceType')
    .notEmpty().withMessage('Resource type is required.')
    .isIn(RESOURCE_TYPES).withMessage('Invalid resource type.'),

  body('unit')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Unit must be at most 100 characters.'),

  body('tags')
    .optional()
    .customSanitizer((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      return val;
    })
    .isArray().withMessage('Tags must be an array.')
    .custom((tags) => {
      if (tags.length > 10) throw new Error('Maximum 10 tags allowed.');
      return true;
    }),
];

/**
 * Validation rules for PUT /api/resources/:id (update resource)
 */
const updateResourceValidators = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1 and 2000 characters.'),

  body('college')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('College name must be between 2 and 200 characters.'),

  body('degree')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Degree must be between 1 and 100 characters.'),

  body('branch')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Branch must be between 1 and 100 characters.'),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 }).withMessage('Semester must be an integer between 1 and 8.')
    .toInt(),

  body('subject')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Subject must be between 1 and 200 characters.'),

  body('resourceType')
    .optional()
    .isIn(RESOURCE_TYPES).withMessage('Invalid resource type.'),

  body('tags')
    .optional()
    .customSanitizer((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      return val;
    })
    .isArray().withMessage('Tags must be an array.')
    .custom((tags) => {
      if (tags.length > 10) throw new Error('Maximum 10 tags allowed.');
      return true;
    }),
];

module.exports = { createResourceValidators, updateResourceValidators };
