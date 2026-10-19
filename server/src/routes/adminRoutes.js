'use strict';

const { Router } = require('express');
const { getStats, getPendingResources, moderateResource, getReports, updateReport, getUsers, updateUserStatus } = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);
router.get('/resources/pending', getPendingResources);
router.patch('/resources/:id/moderation', moderateResource);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
