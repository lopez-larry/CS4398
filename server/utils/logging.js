/**
 * @file logging.js
 * @description Centralized Winston logger configuration for consistent application logging.
 *
 * Features:
 *  - Logs all messages with level `info` and above (change via LOG_LEVEL env).
 *  - Writes logs to both a file and the console.
 *  - Uses JSON format for structured logging (prod), pretty-print in dev.
 *
 * Log Outputs:
 *  - File: logs/server.log
 *  - Console: stdout (dev-friendly)
 *
 * Usage:
 *  const logger = require('../utils/logging');
 *  logger.info('Server started successfully');
 *  logger.error('Database connection failed');
 */

const winston = require('winston');

const logLevel = process.env.LOG_LEVEL || 'info';

// Common formats
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

const prodFormat = winston.format.json();

// Create Winston logger instance
const logger = winston.createLogger({
  level: logLevel, // error, warn, info, http, verbose, debug, silly
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    // Save logs to a file (always JSON for parsing)
    new winston.transports.File({ filename: 'logs/server.log', format: prodFormat }),

    // Print logs to the console
    new winston.transports.Console(),
  ],
});

module.exports = logger;
