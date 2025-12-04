/**
 * @file authMiddleware.js
 * @description Middleware to enforce authentication, verification, and role-based access.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Ensure the request has a valid JWT
 */
const ensureAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[AUTH] Missing or malformed token');
    return res.status(403).json({ message: 'Authorization denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.warn('[AUTH] Token valid but user not found:', decoded.id);
      return res.status(403).json({ message: 'Authorization denied. User not found.' });
    }

    next();
  } catch (err) {
    console.error('[AUTH] Token verification failed:', err.message);
    return res.status(403).json({ message: 'Authorization denied. Invalid token.' });
  }
};

/**
 * Ensure the authenticated user has verified their email
 */
const ensureVerified = (req, res, next) => {
  if (!req.user) {
    console.warn('[VERIFY] No user attached to request');
    return res.status(403).json({ message: 'Access denied. No user found.' });
  }

  if (!req.user.isVerified) {
    console.warn('[VERIFY] User not verified:', req.user.email);
    return res.status(403).json({ message: 'Access denied. Email not verified.' });
  }

  next();
};

/**
 * Ensure the authenticated user is an admin
 */
const ensureAdmin = (req, res, next) => {
  if (!req.user) {
    console.warn('[ADMIN] No user attached to request');
    return res.status(403).json({ message: 'Access denied. No user found.' });
  }

  if (req.user.role !== 'admin') {
    console.warn('[ADMIN] User is not admin:', req.user.email);
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

module.exports = {
  ensureAuth,
  ensureVerified,
  ensureAdmin,
};
