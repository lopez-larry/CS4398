/**
 * @file userHelpers.js
 * @description Utility to sanitize user objects before sending them to clients.
 *
 * Strips sensitive fields and ensures only safe data is returned.
 */

function buildSafeUserResponse(user) {
  if (!user) return null;

  const obj = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    _id: obj._id,
    username: obj.username,
    email: obj.email,
    role: obj.role,

    // Names
    firstName: obj.firstName || '',
    lastName: obj.lastName || '',

    // Breeder info (optional for role)
    breederProfile: obj.breederProfile || null,

    // Profile image references
    profileImage: obj.profileImage || null,
    profileImageKey: obj.profileImageKey || null,

    // Account status
    isVerified: !!obj.isVerified,
    isLocked: !!obj.isLocked,

    // Consent and metadata
    consent: obj.consent ?? null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt ?? null,

    // Customer favorites (if available)
    favorites: obj.favorites || [],

    // For breeder listings
    averageRating: obj.averageRating || 0,
  };
}

module.exports = { buildSafeUserResponse };
