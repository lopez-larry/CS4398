/**
 * @file buildSafeUserResponse.js
 * @description Sanitize user objects for safe frontend exposure.
 *
 * Strips sensitive fields; returns only non-sensitive, relevant user details.
 * Booleans are coerced to ensure stable UI rendering.
 */

function buildSafeUserResponse(user) {
  if (!user || typeof user !== 'object') return null;

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,

    // Flags used by AdminUserList
    isVerified: !!user.isVerified,
    isLocked: !!user.isLocked,

    // Timestamps / optional fields
    createdAt: user.createdAt,
    updatedAt: user.updatedAt ?? null,
    consent: user.consent ?? null,
    profileImage: user.profileImage ?? null,
  };
}

module.exports = { buildSafeUserResponse };
