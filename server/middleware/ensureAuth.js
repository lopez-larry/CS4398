/**
 * ensureAuth.js
 * Require a logged-in session (Passport or custom).
 * - If req.isAuthenticated() exists (Passport), use it.
 * - Otherwise fall back to presence of req.user.
 */
module.exports = function ensureAuth(req, res, next) {
  try {
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
      return next();
    }
    if (req.user) {
      return next();
    }
    return res
      .status(401)
      .json({ code: 'NOT_AUTHENTICATED', error: 'Sign in required.' });
  } catch (e) {
    return res
      .status(401)
      .json({ code: 'NOT_AUTHENTICATED', error: 'Sign in required.' });
  }
};
