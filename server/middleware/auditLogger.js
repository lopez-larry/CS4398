/**
 * @file auditLogger.js
 * @description Request audit middleware (JWT-first), with redaction + status/duration.
 */

const AuditLog = require('../models/AuditLog');

// Keys we should never store verbatim
const SENSITIVE_KEYS = new Set([
  'password', 'oldPassword', 'newPassword',
  'token', 'resetToken', 'verificationToken',
  'authorization', 'cookie'
]);

const redact = (input) => {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(redact);
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      out[k] = redact(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

const shouldSkip = (req) => {
  const p = req.path || req.originalUrl || '';
  // Don’t log noise or secrets-heavy endpoints
  if (req.method === 'OPTIONS') return true;
  if (p === '/favicon.ico') return true;

  // Common static/health paths
  if (p.startsWith('/assets') || p.startsWith('/static') || p.startsWith('/public')) return true;
  if (p === '/' || p === '/api/health' || p === '/healthz' || p === '/readyz') return true;

  // Auth endpoints (skip secrets-heavy routes)
  const skipPaths = [
    // legacy /api/auth/*
    '/api/auth/login', '/api/auth/register', '/api/auth/logout',
    '/api/auth/reset-password', '/api/auth/verify-email',
    '/api/auth/forgot-password', '/api/auth/resend-verification',

    // current /api/user/*
    '/api/user/login', '/api/user/register', '/api/user/logout',
    '/api/user/current_user', '/api/user/reset-password',
    '/api/user/verify-email', '/api/user/forgot-password',
    '/api/user/resend-verification',
  ];

  if (skipPaths.some(path => p.startsWith(path))) return true;

  return false;
};

const auditLogger = (req, res, next) => {
  if (shouldSkip(req)) return next();

  const start = process.hrtime.bigint();

  // Grab first hop IP if behind proxy
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = fwd || req.ip;

  // Capture minimal file info if present (don’t store buffers)
  let filesMeta = undefined;
  if (req.file) {
    filesMeta = [{ fieldname: req.file.fieldname, originalname: req.file.originalname, size: req.file.size }];
  } else if (Array.isArray(req.files)) {
    filesMeta = req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size }));
  } else if (req.files && typeof req.files === 'object') {
    filesMeta = Object.values(req.files).flat().map(f => ({
      fieldname: f.fieldname, originalname: f.originalname, size: f.size
    }));
  }

  res.on('finish', () => {
    try {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;

      const userId = req.user?._id || null; // JWT-first; we’re keeping Passport for now, but avoid req.session here
      const action = `${req.method} ${req.originalUrl || req.url}`;

      const metadata = {
        status: res.statusCode,
        durationMs: Math.round(durationMs),
        ip,
        userAgent: req.headers['user-agent'],
        query: redact(req.query),
        params: redact(req.params),
        body: redact(req.body),
      };

      if (filesMeta) metadata.files = filesMeta;

      // Fire-and-forget; don’t block response path
      AuditLog.create({
        userId,
        action,
        ip,
        metadata
      }).catch((e) => {
        // swallow errors; never crash the request due to logging
        // console.warn('Audit logger create failed:', e.message);
      });
    } catch (e) {
      // never throw from here
      // console.warn('Audit logger post-finish failed:', e.message);
    }
  });

  next();
};

module.exports = auditLogger;
