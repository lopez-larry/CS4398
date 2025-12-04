/**
 * @file policyRoute.js
 * @description Provides the latest consent version and other policy metadata.
 * This route is public — no authentication required.
 */

const express = require('express');
const router = express.Router();

// Static values (could later be stored in DB or CMS)
const CURRENT_CONSENT_VERSION = '2024.07.01';
const LAST_UPDATED = '2024-07-01T00:00:00Z';

/**
 * GET /api/policies/consent-version
 * Returns the current consent version info
 */
router.get('/consent-version', (req, res) => {
  res.json({
    version: CURRENT_CONSENT_VERSION,
    lastUpdated: LAST_UPDATED,
  });
});

module.exports = router;
