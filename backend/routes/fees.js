const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all fees (optionally filtered by studentId)
router.get('/', async (req, res) => {
  try {
    const { studentId, status, feeType } = req.query;
    let query = `
      SELECT f.*, s.full_name, s.roll_no, s.department
      FROM fees f
      JOIN students s ON s.id = f.student_id
      WHERE 1=1
    `;
    const params = [];

    if (studentId) { params.push(studentId); query += ` AND f.student_id = $${params.length}`; }
    if (status)    { params.push(status);    query += ` AND f.status = $${params.length}`; }
    if (feeType)   { params.push(feeType);   query += ` AND f.fee_type = $${params.length}`; }

    query += ' ORDER BY f.id ASC';
    const result = await pool.query(query, params);
    res.json(result.rows.map(camelize));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET fees for one student
router.get('/student/:studentId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM fees WHERE student_id=$1 ORDER BY id ASC',
      [req.params.studentId]
    );
    res.json(result.rows.map(camelize));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create fee record
router.post('/', async (req, res) => {
  try {
    const {
      studentId, feeType, amount, semester, academicYear,
      status, dueDate, paidDate, paymentMode, transactionId, receiptNo, remarks
    } = req.body;

    const result = await pool.query(`
      INSERT INTO fees
        (student_id, fee_type, amount, semester, academic_year, status,
         due_date, paid_date, payment_mode, transaction_id, receipt_no, remarks)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [studentId, feeType, amount, semester, academicYear, status || 'unpaid',
        dueDate || null, paidDate || null, paymentMode || null,
        transactionId || null, receiptNo || null, remarks || '']);

    res.status(201).json(camelize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update fee (e.g., mark as paid)
router.put('/:id', async (req, res) => {
  try {
    const {
      status, paidDate, paymentMode, transactionId, receiptNo, remarks
    } = req.body;

    const result = await pool.query(`
      UPDATE fees SET
        status=$1, paid_date=$2, payment_mode=$3,
        transaction_id=$4, receipt_no=$5, remarks=$6
      WHERE id=$7
      RETURNING *
    `, [status, paidDate || null, paymentMode || null,
        transactionId || null, receiptNo || null, remarks || '', req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'Fee record not found' });
    res.json(camelize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE fee record
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM fees WHERE id=$1', [req.params.id]);
    res.json({ message: 'Fee record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'paid')   AS total_paid,
        COUNT(*) FILTER (WHERE status = 'unpaid') AS total_unpaid,
        SUM(amount) FILTER (WHERE status = 'paid')   AS amount_collected,
        SUM(amount) FILTER (WHERE status = 'unpaid') AS amount_pending
      FROM fees
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function camelize(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    feeType: row.fee_type,
    amount: row.amount,
    semester: row.semester,
    academicYear: row.academic_year,
    status: row.status,
    dueDate: row.due_date,
    paidDate: row.paid_date,
    paymentMode: row.payment_mode,
    transactionId: row.transaction_id,
    receiptNo: row.receipt_no,
    remarks: row.remarks,
    fullName: row.full_name,
    rollNo: row.roll_no,
    department: row.department,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
