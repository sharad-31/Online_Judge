const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { signup, login, changePassword } = require('../controllers/authController');

router.put('/change-password', authMiddleware, changePassword);
router.post('/signup', signup);
router.post('/login', login);

// Protected route
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;