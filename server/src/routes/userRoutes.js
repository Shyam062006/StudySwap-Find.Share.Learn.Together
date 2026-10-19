'use strict';

const { Router } = require('express');
const { getMe, updateMe } = require('../controllers/userController');
const { getMyResources } = require('../controllers/resourceController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.get('/me/resources', authenticate, getMyResources);

module.exports = router;
