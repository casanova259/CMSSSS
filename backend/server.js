require('dotenv').config();
const express = require('express');
const cors = require('cors');

const studentsRouter = require('./routes/students');
const feesRouter     = require('./routes/fees');
const drccRouter     = require('./routes/drcc');
const nodueRouter    = require('./routes/nodue');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Health check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/students',  studentsRouter);
app.use('/api/fees',      feesRouter);
app.use('/api/drcc',      drccRouter);
app.use('/api/no-due',    nodueRouter);

// ── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 College Admin API running on http://localhost:${PORT}`);
  console.log('   Endpoints:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/students');
  console.log('   GET  /api/fees');
  console.log('   GET  /api/drcc');
  console.log('   GET  /api/no-due\n');
});
