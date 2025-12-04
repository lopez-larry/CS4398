/**
 * @file breederRoutes.js
 * @description Routes for viewing, searching, and reviewing verified breeders.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuth } = require('../middleware/authMiddleware');

// AWS SDK for signed URLs
const { s3 } = require('../config/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// --------------------------------------------
// GET all verified breeders (public)
// Supports: search, sort, pagination
// --------------------------------------------
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || '').trim();
    const sortBy = req.query.sortBy || 'username'; // or 'averageRating'
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const query = {
      role: 'breeder',
      isVerified: true,
      ...(search && {
        $or: [
          { username: new RegExp(search, 'i') },
          { 'breederProfile.kennelName': new RegExp(search, 'i') },
          { 'breederProfile.location.city': new RegExp(search, 'i') },
          { 'breederProfile.location.state': new RegExp(search, 'i') },
        ],
      }),
    };

    const [breeders, total] = await Promise.all([
      User.find(query)
        .select(
          'username breederProfile profileImage profileImageKey averageRating reviews createdAt'
        )
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Attach signed S3 URLs for each breeder
    for (const breeder of breeders) {
      if (breeder.profileImageKey) {
        try {
          breeder.profileImageUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: breeder.profileImageKey,
            }),
            { expiresIn: 3600 } // 1 hour
          );
        } catch (err) {
          console.error(`[BREEDER] Error generating signed URL for ${breeder.username}:`, err);
          breeder.profileImageUrl = null;
        }
      } else {
        breeder.profileImageUrl = null;
      }
    }

    console.log('[BREEDERS] Query:', query);
    console.log('[BREEDERS] Found:', breeders.length);
    breeders.forEach((b, i) => {
      console.log(`[BREEDER ${i + 1}] username=${b.username}`);
      console.log(`  profileImageKey=${b.profileImageKey}`);
      console.log(`  profileImageUrl=${b.profileImageUrl}`);
    });

    res.json({
      breeders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error fetching breeders:', err);
    res.status(500).json({ message: 'Server error fetching breeders' });
  }
});

module.exports = router;
