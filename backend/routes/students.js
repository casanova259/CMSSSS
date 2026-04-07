const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all students
router.get('/', async (req, res) => {
  try {
    const { department, year, search } = req.query;
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (department) {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }
    if (year) {
      params.push(year);
      query += ` AND year = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR roll_no ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    query += ' ORDER BY id ASC';
    const result = await pool.query(query, params);
    res.json(result.rows.map(camelizeStudent));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(camelizeStudent(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
router.post('/', async (req, res) => {
  try {
    const {
      fullName, rollNo, uniRollNo, department, year, semester,
      email, phone, hostelRoom, isDRCC, photo,
      bankAccount, ifscCode, bankName
    } = req.body;

    const result = await pool.query(`
      INSERT INTO students
        (full_name, roll_no, uni_roll_no, department, year, semester, email, phone,
         hostel_room, is_drcc, photo, bank_account, ifsc_code, bank_name)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
    `, [fullName, rollNo, uniRollNo, department, year, semester, email, phone,
        hostelRoom || null, isDRCC || false, photo || '👨‍🎓',
        bankAccount, ifscCode, bankName]);

    res.status(201).json(camelizeStudent(result.rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Roll number or email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const {
      fullName, rollNo, uniRollNo, department, year, semester,
      email, phone, hostelRoom, isDRCC, photo,
      bankAccount, ifscCode, bankName
    } = req.body;

    const result = await pool.query(`
      UPDATE students SET
        full_name=$1, roll_no=$2, uni_roll_no=$3, department=$4, year=$5,
        semester=$6, email=$7, phone=$8, hostel_room=$9, is_drcc=$10,
        photo=$11, bank_account=$12, ifsc_code=$13, bank_name=$14
      WHERE id=$15
      RETURNING *
    `, [fullName, rollNo, uniRollNo, department, year, semester, email, phone,
        hostelRoom || null, isDRCC || false, photo,
        bankAccount, ifscCode, bankName, req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(camelizeStudent(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: snake_case → camelCase for frontend compatibility
function camelizeStudent(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    rollNo: row.roll_no,
    uniRollNo: row.uni_roll_no,
    department: row.department,
    year: row.year,
    semester: row.semester,
    email: row.email,
    phone: row.phone,
    hostelRoom: row.hostel_room,
    isDRCC: row.is_drcc,
    photo: row.photo,
    bankAccount: row.bank_account,
    ifscCode: row.ifsc_code,
    bankName: row.bank_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
