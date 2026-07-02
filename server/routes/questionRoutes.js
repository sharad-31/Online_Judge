const express = require('express');
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
  getSampleTestCases,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public routes
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);
router.get('/:id/testcases/sample', getSampleTestCases);

// Admin-only routes (auth check first, then admin check)
router.post('/', authMiddleware, isAdmin, createQuestion);
router.put('/:id', authMiddleware, isAdmin, updateQuestion);
router.delete('/:id', authMiddleware, isAdmin, deleteQuestion);

module.exports = router;