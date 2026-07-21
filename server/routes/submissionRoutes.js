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

// Internal route — worker yahan POST karega
router.post('/internal/verdict', async (req, res) => {
    const { submissionId, userId, verdict, executionTime } = req.body;
    
    // Socket emit karo
    const io = req.app.get('io');
    if (io) {
        io.to(userId.toString()).emit('verdict', {
            submissionId,
            verdict,
            executionTime
        });
    }
    
    res.json({ ok: true });
});

module.exports = router;