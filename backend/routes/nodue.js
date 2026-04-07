const express = require('express');
const router = express.Router();
const pool = require('../db');

const DEPARTMENTS = ['library', 'hostel', 'accounts', 'department', 'examCell'];

// GET all no-due applications (with clearances nested)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT n.*, s.full_name, s.roll_no, s.uni_roll_no, s.department AS dept, s.year, s.email
      FROM no_due_applications n
      JOIN students s ON s.id = n.student_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { params.push(status); query += ` AND n.status = $${params.length}`; }
    query += ' ORDER BY n.applied_date DESC';

    const apps = await pool.query(query, params);
    const clearances = await pool.query('SELECT * FROM no_due_clearances');

    const result = apps.rows.map(app => {
      const appClearances = clearances.rows.filter(c => c.application_id === app.id);
      const clearanceMap = {};
      for (const d of DEPARTMENTS) {
        const found = appClearances.find(c => c.department === d);
        clearanceMap[d] = found
          ? { cleared: found.cleared, clearedBy: found.cleared_by, date: found.cleared_date, remarks: found.remarks }
          : { cleared: false, clearedBy: '', date: null, remarks: '' };
      }
      return {
        id: app.id,
        studentId: app.student_id,
        appliedDate: app.applied_date,
        status: app.status,
        certificateGenerated: app.certificate_generated,
        certificateDate: app.certificate_date,
        clearances: clearanceMap,
        fullName: app.full_name,
        rollNo: app.roll_no,
        uniRollNo: app.uni_roll_no,
        department: app.dept,
        year: app.year,
        email: app.email,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one application
router.get('/:id', async (req, res) => {
  try {
    const app = await pool.query(`
      SELECT n.*, s.full_name, s.roll_no, s.department AS dept
      FROM no_due_applications n
      JOIN students s ON s.id = n.student_id
      WHERE n.id=$1
    `, [req.params.id]);

    if (!app.rows.length) return res.status(404).json({ error: 'Not found' });

    const clears = await pool.query(
      'SELECT * FROM no_due_clearances WHERE application_id=$1', [req.params.id]
    );
    const clearanceMap = {};
    for (const d of DEPARTMENTS) {
      const found = clears.rows.find(c => c.department === d);
      clearanceMap[d] = found
        ? { cleared: found.cleared, clearedBy: found.cleared_by, date: found.cleared_date, remarks: found.remarks }
        : { cleared: false, clearedBy: '', date: null, remarks: '' };
    }

    const row = app.rows[0];
    res.json({
      id: row.id, studentId: row.student_id, appliedDate: row.applied_date,
      status: row.status, certificateGenerated: row.certificate_generated,
      certificateDate: row.certificate_date, clearances: clearanceMap,
      fullName: row.full_name, rollNo: row.roll_no, department: row.dept,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create no-due application
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId, appliedDate } = req.body;
    await client.query('BEGIN');

    const app = await client.query(`
      INSERT INTO no_due_applications (student_id, applied_date)
      VALUES ($1, $2) RETURNING *
    `, [studentId, appliedDate || new Date().toISOString().split('T')[0]]);

    const appId = app.rows[0].id;

    // Create default clearance rows for each department
    for (const dept of DEPARTMENTS) {
      await client.query(`
        INSERT INTO no_due_clearances (application_id, department) VALUES ($1, $2)
      `, [appId, dept]);
    }

    await client.query('COMMIT');
    res.status(201).json({ id: appId, studentId, status: 'pending' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT update a single clearance
router.put('/:id/clearance/:dept', async (req, res) => {
  try {
    const { cleared, clearedBy, remarks } = req.body;
    const { id, dept } = req.params;

    if (!DEPARTMENTS.includes(dept)) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    await pool.query(`
      UPDATE no_due_clearances SET
        cleared=$1, cleared_by=$2, cleared_date=CASE WHEN $1 THEN CURRENT_DATE ELSE NULL END, remarks=$3
      WHERE application_id=$4 AND department=$5
    `, [cleared, clearedBy || null, remarks || '', id, dept]);

    // Check if all cleared → auto-update status to complete
    const all = await pool.query(
      'SELECT cleared FROM no_due_clearances WHERE application_id=$1', [id]
    );
    const allCleared = all.rows.every(r => r.cleared);
    if (allCleared) {
      await pool.query(
        "UPDATE no_due_applications SET status='complete' WHERE id=$1", [id]
      );
    }

    res.json({ message: 'Clearance updated', allCleared });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT generate certificate
router.put('/:id/certificate', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE no_due_applications
      SET certificate_generated=true, certificate_date=CURRENT_DATE
      WHERE id=$1 AND status='complete'
      RETURNING *
    `, [req.params.id]);
    if (!result.rows.length) return res.status(400).json({ error: 'Application not complete or not found' });
    res.json({ message: 'Certificate generated', date: result.rows[0].certificate_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
