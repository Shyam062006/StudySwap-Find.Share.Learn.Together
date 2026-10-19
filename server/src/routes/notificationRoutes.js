'use strict';

const { Router } = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);

module.exports = router;
