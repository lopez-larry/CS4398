// models/LoginAttempt.js
const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true },
    ip: { type: String, trim: true },
    endpoint: { type: String, trim: true },
    success: { type: Boolean, default: false },
    // auto-delete attempts after 30 days (good for rate limiting / cleanup)
    timestamp: { type: Date, default: Date.now, expires: '30d' },
  },
  {
    versionKey: false, // hide __v
  }
);

// Indexes to quickly query attempts by email or IP
loginAttemptSchema.index({ email: 1, timestamp: -1 });
loginAttemptSchema.index({ ip: 1, timestamp: -1 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
