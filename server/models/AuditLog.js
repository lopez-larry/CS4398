/**
 * @file AuditLog.js
 * @description Stores audit trail logs for user actions (login, logout, profile changes, etc.)
 *
 * Fields:
 *  - userId: User associated with the action
 *  - action: Type of action performed (e.g., LOGIN_SUCCESS, PROFILE_UPDATED)
 *  - timestamp: When the action occurred
 *  - ip: Origin IP address of the request
 *  - metadata: Optional metadata (e.g., resumeId, email attempted)
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    action: { type: String, required: true, trim: true },
    // keep explicit timestamp for compatibility with existing code
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    strict: true,
    minimize: false,      // keep empty objects like {}
    versionKey: false,    // hide __v
  }
);

// Helpful indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);