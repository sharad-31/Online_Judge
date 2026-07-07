const express = require('express');
const router = express.Router();
const { getGlobalLeaderboard, getUserStats } = require('../controllers/leaderboardController');

router.get('/global', getGlobalLeaderboard);
router.get('/users/:userId/stats', getUserStats);

module.exports = router;