// =====================================================
//  logger.js — Winston Logger
//
//  Dev:        pretty colored logs in terminal
//  Production: JSON logs saved to /app/logs/
//              (mounted to backend/logs/ on your computer)
// =====================================================

const winston = require('winston');
const path    = require('path');

const { combine, timestamp, colorize, printf, json } = winston.format;

const isDev = process.env.NODE_ENV !== 'production';

// ── Dev Format: pretty + colored ─────────────────────
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp, level, message, ...meta }) => {
    const extras = Object.keys(meta).length
      ? ' ' + JSON.stringify(meta)
      : '';
    return `${timestamp} ${level}: ${message}${extras}`;
  })
);

// ── Production Format: JSON ───────────────────────────
const prodFormat = combine(
  timestamp(),
  json()
);

// ── Log file paths ────────────────────────────────────
// /app/logs is mounted to backend/logs/ on your computer
const LOG_DIR = path.join('/app', 'logs');

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'http',
  format: isDev ? devFormat : prodFormat,

  transports: [
    // Always log to console (visible in docker logs -f)
    new winston.transports.Console(),

    // Production only: also save to files
    ...(!isDev ? [
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'combined.log'),
        level: 'http',
        maxsize: 5 * 1024 * 1024,  // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
    ] : []),
  ],

  exitOnError: false,
});

module.exports = logger;