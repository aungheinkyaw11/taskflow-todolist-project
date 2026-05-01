// =====================================================
//  backend/routes/taskRoutes.js
//  Logging: console only
// =====================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db');

const router = express.Router();

// All task routes require a valid JWT token
router.use(authMiddleware);


// ── GET /api/tasks ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [req.user.id];
    const conditions = [];

    if (status)   { conditions.push(`status = $${values.length + 1}`);   values.push(status); }
    if (priority) { conditions.push(`priority = $${values.length + 1}`); values.push(priority); }
    if (conditions.length) query += ' AND ' + conditions.join(' AND ');
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(`[ERROR] Fetch tasks failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/tasks/stats/summary ──────────────────────
// NOTE: This must come BEFORE /:id route
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE status = 'todo')          AS todo,
        COUNT(*) FILTER (WHERE status = 'in_progress')   AS in_progress,
        COUNT(*) FILTER (WHERE status = 'done')          AS done,
        COUNT(*) FILTER (WHERE priority = 'high')        AS high_priority
      FROM tasks WHERE user_id = $1
    `, [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`[ERROR] Fetch stats failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/tasks/:id ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`[ERROR] Fetch task ${req.params.id} failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


// ── POST /api/tasks ───────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, status, priority, due_date || null, req.user.id]
    );
    console.log(`[INFO] Task created: "${title}" by user ${req.user.id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(`[ERROR] Create task failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


// ── PUT /api/tasks/:id ────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET
        title       = COALESCE($1, title),
        description = COALESCE($2, description),
        status      = COALESCE($3, status),
        priority    = COALESCE($4, priority),
        due_date    = COALESCE($5, due_date),
        updated_at  = NOW()
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, description, status, priority, due_date, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`[ERROR] Update task ${req.params.id} failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


// ── DELETE /api/tasks/:id ─────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    console.log(`[INFO] Task ${req.params.id} deleted by user ${req.user.id}`);
    res.json({ message: 'Task deleted', task: result.rows[0] });
  } catch (err) {
    console.error(`[ERROR] Delete task ${req.params.id} failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
