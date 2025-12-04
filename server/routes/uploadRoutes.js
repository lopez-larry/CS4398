/**
 * @file uploadRoutes.js
 * @description Handles file uploads (dog images, profile images, etc.) with AWS S3
 */

const express = require('express');
const multer = require('multer');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3, bucketName } = require('../config/s3');;
const jwtAuth = require('../middleware/jwtAuth');
const User = require('../models/User');

const router = express.Router();

// ---------------------------------------------
// Multer memory storage (buffer → S3)
// ---------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------------------------------
// Dog Image Upload Route
// ---------------------------------------------
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uniqueSuffix = `${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueSuffix,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueSuffix,
      }),
      { expiresIn: 3600 }
    );

    res.json({ key: uniqueSuffix, url: signedUrl });
  } catch (err) {
    console.error('❌ S3 upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// ---------------------------------------------
// Signed URL Fetch Route
// ---------------------------------------------
router.get('/image/:key', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.key,
    };

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(params),
      { expiresIn: 3600 }
    );

    res.json({ url: signedUrl });
  } catch (err) {
    console.error('❌ Signed URL error:', err);
    res.status(500).json({ error: 'Could not generate image URL' });
  }
});

// ---------------------------------------------
// Profile Image Upload Route (protected)
// ---------------------------------------------
router.post('/profile-image', jwtAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Prefix with "profiles/"
    const key = `profiles/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // Update user with new key
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImageKey: key },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate signed URL on the fly
    let signedUrl = null;
    if (user.profileImageKey) {
      signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: user.profileImageKey,
        }),
        { expiresIn: 3600 }
      );
    }

    // Attach signed URL to response
    const updatedUser = user.toJSON();
    updatedUser.profileImageUrl = signedUrl;

    res.json({ updatedUser });
  } catch (err) {
    console.error('❌ Profile image upload error:', err);
    res.status(500).json({ error: 'Profile upload failed', details: err.message });
  }
});

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = router;
