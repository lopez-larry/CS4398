// middleware/jwtAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🚨 Require JWT_SECRET — no fallback in prod
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (optional — load from DB if you need fresh data)
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = jwtAuth;
