/**
 * @file publicRoutes.js
 * @description Handles public-facing routes such as feedback submissions.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Submission = require('../models/Submission');

// Rate limiter: max 5 feedbacks per IP/hour
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Simple email regex for validation (not perfect, but good enough for public form)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/public/feedback
router.post('/feedback', feedbackLimiter, async (req, res) => {
  const { name, message, email } = req.body;

  if (
    typeof name !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({ message: 'Name and message are required.' });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (name.length > 100 || message.length > 2000) {
    return res.status(400).json({ message: 'Input too long.' });
  }

  try {
    const submission = new Submission({
      name: name.trim(),
      message: message.trim(),
      email: email?.trim() || undefined,
    });

    await submission.save();

    // Optional: hook into audit logger here if needed
    console.log(`[FEEDBACK] Submission received from ${email || 'anonymous'}`);

    res.status(201).json({ message: 'Submission received!' });
  } catch (err) {
    console.error('[SUBMIT ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
