/**
 * @file Session.js
 * @description Defines the Mongoose schema and model for user sessions.
 *
 * Features:
 *  - Stores reference to the authenticated user.
 *  - Saves a session token (e.g., JWT or session ID).
 *  - Automatically expires and removes sessions after 1 hour using TTL index.
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Reference to the user this session belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // The session token (JWT or session ID)
  token: {
    type: String,
    required: true,
    unique: true, // prevent duplicate sessions with same token
  },

  // TTL index: MongoDB will delete session 1 hour after this timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1h',
  },
});

// Create and export the Session model
module.exports = mongoose.model('Session', sessionSchema);
