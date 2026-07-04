const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { signup, login, changePassword ,getMe } = require('../controllers/authController');

router.put('/change-password', authMiddleware, changePassword);
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);


module.exports = router;