// =====================================================
//  server.js — Production Ready + Authentication
//  Logging: console only (ELK will collect these)
// =====================================================

require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors    = require('cors');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());


// ── HTTP Request Logger ───────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();

  // Capture real IP (works behind Nginx proxy)
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
          || req.headers['x-real-ip']
          || req.ip
          || 'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? 'ERROR' :
                     res.statusCode >= 400 ? 'WARN'  : 'INFO';

    const timestamp = new Date().toISOString();

    console.log(
      `[${level}] ${timestamp} | ${req.method} ${req.originalUrl} | ` +
      `status=${res.statusCode} | duration=${duration}ms | ` +
      `ip=${ip} | ua=${userAgent}`
    );
  });

  next();
});


// ── Routes ────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/tasks', taskRoutes);

// ── Health check ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});


// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  console.warn(`[WARN] ${timestamp} | Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});


// ── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(
    `[ERROR] ${timestamp} | Unhandled error | ` +
    `${req.method} ${req.originalUrl} | ${err.message}`
  );
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});


// ── Start Server ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[INFO] ${new Date().toISOString()} | TaskFlow backend started`);
  console.log(`[INFO] ${new Date().toISOString()} | Port: ${PORT}`);
  console.log(`[INFO] ${new Date().toISOString()} | Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] ${new Date().toISOString()} | Node: ${process.version}`);
});