/**
 * @file logAudit.js
 * @description Utility for recording audit logs.
 *
 * Features:
 *  - Records user actions (login, logout, consent, profile changes, etc.)
 *  - Non-blocking: failures are caught and logged to console but won’t crash requests
 */

const AuditLog = require('../models/AuditLog');

/**
 * Save an audit log entry
 *
 * @param {Object} params
 * @param {String} params.userId - ID of the user performing the action (optional)
 * @param {String} params.action - Action identifier (e.g., LOGIN_SUCCESS, CONSENT_GIVEN)
 * @param {String} params.ip - IP address of the client
 * @param {Object} params.metadata - Optional metadata (e.g., email, reason for failure)
 */
const logAudit = async ({ userId, action, ip, metadata }) => {
  try {
    const log = new AuditLog({
      action,
      ip,
      metadata,
    });

    if (userId) log.userId = userId;

    // Fire-and-forget: don’t let logging block requests
    await log.save().catch((err) => {
      console.warn('[AuditLog] Failed to save entry:', err.message);
    });
  } catch (err) {
    console.warn('[AuditLog] Unexpected error:', err.message);
  }
};

module.exports = logAudit;
