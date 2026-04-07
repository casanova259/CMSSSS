const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all DRCC applications
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT d.*, s.full_name, s.roll_no, s.uni_roll_no, s.department, s.year, s.email
      FROM drcc_applications d
      JOIN students s ON s.id = d.student_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { params.push(status); query += ` AND d.status = $${params.length}`; }
    query += ' ORDER BY d.applied_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(camelize));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one application
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, s.full_name, s.roll_no, s.department
      FROM drcc_applications d
      JOIN students s ON s.id = d.student_id
      WHERE d.id=$1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(camelize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create DRCC application
router.post('/', async (req, res) => {
  try {
    const {
      studentId, cautionDeposit, deductions, refundableAmount,
      appliedDate, documents, comments
    } = req.body;

    const result = await pool.query(`
      INSERT INTO drcc_applications
        (student_id, caution_deposit, deductions, refundable_amount, applied_date, documents, comments)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `, [studentId, cautionDeposit || 0, deductions || 0, refundableAmount || 0,
        appliedDate || new Date().toISOString().split('T')[0],
        documents || [], comments || '']);

    res.status(201).json(camelize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT approve / reject
router.put('/:id', async (req, res) => {
  try {
    const {
      status, processedBy, rejectionReason,
      deductions, refundableAmount, comments
    } = req.body;

    const result = await pool.query(`
      UPDATE drcc_applications SET
        status=$1,
        processed_date = CASE WHEN $1 IN ('approved','rejected') THEN CURRENT_DATE ELSE NULL END,
        processed_by=$2,
        rejection_reason=$3,
        deductions=$4,
        refundable_amount=$5,
        comments=$6
      WHERE id=$7
      RETURNING *
    `, [status, processedBy || null, rejectionReason || null,
        deductions || 0, refundableAmount || 0, comments || '', req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(camelize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function camelize(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    cautionDeposit: row.caution_deposit,
    deductions: row.deductions,
    refundableAmount: row.refundable_amount,
    appliedDate: row.applied_date,
    status: row.status,
    processedDate: row.processed_date,
    processedBy: row.processed_by,
    rejectionReason: row.rejection_reason,
    documents: row.documents,
    comments: row.comments,
    fullName: row.full_name,
    rollNo: row.roll_no,
    uniRollNo: row.uni_roll_no,
    department: row.department,
    year: row.year,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
