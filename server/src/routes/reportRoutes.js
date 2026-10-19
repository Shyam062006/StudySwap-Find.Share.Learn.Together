'use strict';

const { Router } = require('express');
const { submitReport } = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.post('/resources/:id/reports', authenticate, submitReport);

module.exports = router;
