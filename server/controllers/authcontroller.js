const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- Validation helpers ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);

const isValidPassword = (password) =>
  // min 8 chars, at least one letter and one number
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

const signup = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    // 1. Required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required' });
    }

    // 2. Field-level validation
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain at least one letter and one number'
      });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    // 3. Normalize (avoid case-duplicate accounts, strip whitespace)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    // 4. Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Create user
    const newUser = new User({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      phone,
      passwordHash
    });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signup, login };