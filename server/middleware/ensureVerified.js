/**
 * @file ensureVerified.js
 * @description Middleware to restrict access to only verified user accounts.
 *
 * Usage:
 *   const ensureVerified = require('../middleware/ensureVerified');
 *   router.get('/some-protected-route', ensureAuth, ensureVerified, handler);
 *
 * Notes:
 *  - Assumes `ensureAuth` runs before this to populate `req.user`.
 */

module.exports = function ensureVerified(req, res, next) {
  // Ensure authentication ran first
  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized. Please log in.',
      code: 'UNAUTHORIZED'
    });
  }

  // Check verification flag
  if (req.user.isVerified === true) {
    return next();
  }

  // Explicit response for unverified accounts
  return res.status(403).json({
    message: 'Your email is not verified. Please verify before continuing.',
    code: 'EMAIL_NOT_VERIFIED'
  });
};
