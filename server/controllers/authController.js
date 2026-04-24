const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const COLORS = ['#6c63ff','#ff6584','#43e97b','#f7971e','#4facfe','#fa709a','#fee140'];

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use.' });

    const count = await User.countDocuments();
    const user  = await User.create({ name, email, password, color: COLORS[count % COLORS.length] });

    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
