/**
 * @file userController.js
 * @description Controllers for user-related actions (current user, profile, password, account, consent, avatar, breeder profile).
 */

const bcrypt = require('bcrypt');
const User = require('../models/User');
const { s3, bucketName } = require('../config/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logAudit = require('../utils/logAudit');
const { buildSafeUserResponse } = require('../utils/userHelpers');

/**
 * GET /auth/current_user
 */
const getCurrentUser = async (req, res) => {
  if (!req.user) return res.status(401).json(null);

  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json(null);

    let profileImageUrl;
    if (user.profileImageKey) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: user.profileImageKey,
      });
      profileImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    return res.status(200).json({
      ...buildSafeUserResponse(user),
      profileImageUrl,
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /user/profile
 * Updates first/last name and, for breeders, breederProfile fields.
 */
const updateProfile = async (req, res) => {
  try {
    console.log('[DEBUG] Incoming updateProfile body:', req.body);

    const { firstName, lastName, breederProfile } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Basic info
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    // Breeder profile (only apply if user is breeder)
    if (user.role === 'breeder' && breederProfile) {
      user.breederProfile = {
        ...user.breederProfile?.toObject?.() || {},
        ...breederProfile,
        location: {
          ...(user.breederProfile?.location?.toObject?.() || {}),
          ...(breederProfile.location || {}),
        },
      };
      user.markModified('breederProfile');
    }

    await user.save();
    const safeUser = buildSafeUserResponse(user.toObject());
    return res.status(200).json(safeUser);
  } catch (err) {
    console.error('Profile update failed:', err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * POST /user/change-password
 */
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const clientIP = req.headers['x-forwarded-for'] || req.ip;

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      await logAudit({
        userId: req.user._id,
        action: 'CHANGE_PASSWORD_FAILED',
        ip: clientIP,
        metadata: { reason: 'User not found' },
      });
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      await logAudit({
        userId: req.user._id,
        action: 'CHANGE_PASSWORD_FAILED',
        ip: clientIP,
        metadata: { reason: 'Incorrect old password' },
      });
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await logAudit({
      userId: req.user._id,
      action: 'CHANGE_PASSWORD_SUCCESS',
      ip: clientIP,
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);

    await logAudit({
      userId: req.user._id,
      action: 'CHANGE_PASSWORD_FAILED',
      ip: clientIP,
      metadata: { error: err.message },
    });

    return res.status(500).json({ message: 'Error processing request. Please try again later.' });
  }
};

/**
 * DELETE /auth/delete-account
 */
const deleteAccount = async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.ip;

  try {
    await logAudit({
      userId: req.user._id,
      action: 'ACCOUNT_DELETION',
      ip: clientIP,
      metadata: {
        email: req.user.email,
        reason: 'User-initiated deletion',
      },
    });

    await User.findByIdAndDelete(req.user._id);
    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Server error deleting account:', err);
    return res.status(500).json({ message: 'Server error deleting account' });
  }
};

/**
 * POST /user/give-consent
 */
const giveConsent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agreed, version } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'consent.agreed': !!agreed,
          'consent.timestamp': new Date(),
          ...(version ? { 'consent.consentVersion': version } : {}),
        },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'Consent recorded',
      user: buildSafeUserResponse(updatedUser.toObject()),
    });
  } catch (err) {
    console.error('Consent error:', err);
    return res.status(500).json({ message: 'Failed to save consent' });
  }
};

/**
 * PUT /user/withdraw-consent
 */
const withdrawConsent = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'consent.agreed': false,
          'consent.timestamp': new Date(),
        },
        $unset: { 'consent.consentVersion': '' },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(buildSafeUserResponse(updatedUser.toObject()));
  } catch (err) {
    console.error('Withdraw consent error:', err);
    return res.status(500).json({ message: 'Error withdrawing consent' });
  }
};

/**
 * POST /user/upload-profile-image
 */
const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const imageUrl = req.fileUrl || req.file?.path;
    if (!imageUrl) return res.status(400).json({ message: 'No image uploaded' });

    user.profileImage = imageUrl;
    await user.save();

    return res.status(200).json({
      message: 'Profile image updated',
      updatedUser: buildSafeUserResponse(user.toObject()),
    });
  } catch (err) {
    console.error('Upload profile image error:', err);
    return res.status(500).json({ message: 'Failed to upload profile image' });
  }
};

/**
 * DELETE /user/remove-profile-image
 */
const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { profileImage: '' } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'Profile image removed',
      updatedUser: buildSafeUserResponse(user.toObject()),
    });
  } catch (err) {
    console.error('Remove profile image error:', err);
    return res.status(500).json({ message: 'Failed to remove profile image' });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  giveConsent,
  withdrawConsent,
  uploadProfileImage,
  removeProfileImage,
};
