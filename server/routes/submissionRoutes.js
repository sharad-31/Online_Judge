const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { 
    submitCode,
    getSubmissionById,
    getUserSubmissions,
    getQuestionSubmissions
} = require('../controllers/submissionController');

router.post('/', authMiddleware, submitCode);
router.get('/:id', authMiddleware, getSubmissionById);
router.get('/user/:userId', authMiddleware, getUserSubmissions);
router.get('/question/:questionId', authMiddleware, getQuestionSubmissions);

module.exports = router;