'use strict';

const { Router } = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = Router();

// Public endpoint — no authentication required
router.get('/', getLeaderboard);

module.exports = router;
