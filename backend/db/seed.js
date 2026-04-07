require('dotenv').config();
const pool = require('./index');

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database with sample data...\n');
    await client.query('BEGIN');

    // ── Clear existing data ──────────────────────────────────────
    await client.query(`
      TRUNCATE no_due_clearances, no_due_applications, drcc_applications, fees, students
      RESTART IDENTITY CASCADE;
    `);

    // ── Students ─────────────────────────────────────────────────
    const studentsResult = await client.query(`
      INSERT INTO students
        (full_name, roll_no, uni_roll_no, department, year, semester, email, phone, hostel_room, is_drcc, photo, bank_account, ifsc_code, bank_name)
      VALUES
        ('Rahul Sharma',  'CSE001', 'UNI2021001', 'CSE', '4th', 8,  'rahul@college.edu',  '9876543210', 'A-201', true,  '👨‍🎓', '1234567890', 'SBIN0001234', 'SBI'),
        ('Priya Singh',   'ECE002', 'UNI2021002', 'ECE', '3rd', 6,  'priya@college.edu',  '9876543211', 'B-105', false, '👩‍🎓', '0987654321', 'HDFC0001234', 'HDFC'),
        ('Amit Kumar',    'ME003',  'UNI2022003', 'ME',  '2nd', 4,  'amit@college.edu',   '9876543212', null,    false, '👨‍🎓', '1122334455', 'ICIC0001234', 'ICICI'),
        ('Sneha Patel',   'CSE004', 'UNI2020004', 'CSE', '4th', 8,  'sneha@college.edu',  '9876543213', 'B-202', true,  '👩‍🎓', '5566778899', 'SBIN0005678', 'SBI'),
        ('Vikram Reddy',  'ECE005', 'UNI2021005', 'ECE', '3rd', 6,  'vikram@college.edu', '9876543214', 'A-150', false, '👨‍🎓', '6677889900', 'HDFC0005678', 'HDFC'),
        ('Ananya Desai',  'CE006',  'UNI2021006', 'CE',  '2nd', 4,  'ananya@college.edu', '9876543215', 'C-101', false, '👩‍🎓', '7788990011', 'SBIN0009012', 'SBI'),
        ('Rohan Gupta',   'CSE007', 'UNI2020007', 'CSE', '4th', 8,  'rohan@college.edu',  '9876543216', 'A-301', true,  '👨‍🎓', '8899001122', 'HDFC0009012', 'HDFC'),
        ('Kavya Iyer',    'ECE008', 'UNI2022008', 'ECE', '1st', 2,  'kavya@college.edu',  '9876543217', null,    false, '👩‍🎓', '9900112233', 'ICIC0009012', 'ICICI')
      RETURNING id;
    `);
    const ids = studentsResult.rows.map(r => r.id);
    console.log(`  ✅ Inserted ${ids.length} students`);

    // ── Fees ─────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO fees
        (student_id, fee_type, amount, semester, academic_year, status, due_date, paid_date, payment_mode, transaction_id, receipt_no, remarks)
      VALUES
        ($1, 'Tuition', 75000, '8th', '2024-25', 'paid',   '2024-08-15', '2024-08-10', 'Online', 'TXN123456', 'REC001', ''),
        ($2, 'Tuition', 75000, '6th', '2024-25', 'unpaid', '2024-08-15', null, null, null, null, ''),
        ($3, 'Hostel',  25000, '4th', '2024-25', 'paid',   '2024-08-15', '2024-08-12', 'Cash',   null,        'REC002', ''),
        ($4, 'Tuition', 75000, '8th', '2024-25', 'unpaid', '2024-07-30', null, null, null, null, 'Overdue'),
        ($5, 'Exam',     5000, '6th', '2024-25', 'paid',   '2024-08-15', '2024-08-14', 'Online', 'TXN789012', 'REC003', ''),
        ($1, 'Hostel',  30000, '8th', '2024-25', 'paid',   '2024-08-15', '2024-08-11', 'Online', 'TXN234567', 'REC004', ''),
        ($6, 'Tuition', 75000, '4th', '2024-25', 'unpaid', '2024-09-01', null, null, null, null, ''),
        ($7, 'Tuition', 75000, '8th', '2024-25', 'paid',   '2024-08-15', '2024-08-09', 'Cheque', 'CHQ345678', 'REC005', ''),
        ($8, 'Tuition', 75000, '2nd', '2024-25', 'paid',   '2024-08-15', '2024-08-13', 'Online', 'TXN456789', 'REC006', '')
    `, [ids[0], ids[1], ids[2], ids[3], ids[4], ids[5], ids[6], ids[7]]);
    console.log('  ✅ Inserted fees');

    // ── DRCC Applications ─────────────────────────────────────────
    const drccData = [
      { studentId: ids[0], deposit: 5000, deductions: 0,   refundable: 5000, date: '2024-10-01', status: 'pending',  processedDate: null, processedBy: null, reason: null, docs: ['degree.pdf','id.pdf'], comments: '' },
      { studentId: ids[3], deposit: 5000, deductions: 200, refundable: 4800, date: '2024-09-25', status: 'approved', processedDate: '2024-10-15', processedBy: 'Admin', reason: null, docs: ['degree.pdf','id.pdf'], comments: 'Library fine deducted' },
      { studentId: ids[6], deposit: 5000, deductions: 0,   refundable: 5000, date: '2024-10-10', status: 'pending',  processedDate: null, processedBy: null, reason: null, docs: ['degree.pdf','id.pdf','nodue.pdf'], comments: '' },
    ];
    for (const d of drccData) {
      await client.query(`
        INSERT INTO drcc_applications
          (student_id, caution_deposit, deductions, refundable_amount, applied_date, status, processed_date, processed_by, rejection_reason, documents, comments)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `, [d.studentId, d.deposit, d.deductions, d.refundable, d.date, d.status, d.processedDate, d.processedBy, d.reason, d.docs, d.comments]);
    }
    console.log('  ✅ Inserted DRCC applications');

    // ── No-Due Applications + Clearances ─────────────────────────
    const noDueData = [
      {
        studentIdx: 0, appliedDate: '2024-10-01', status: 'pending',
        certGenerated: false, certDate: null,
        clearances: [
          { dept: 'library',    cleared: true,  by: 'Librarian',   date: '2024-10-05', remarks: '' },
          { dept: 'hostel',     cleared: true,  by: 'Warden',      date: '2024-10-06', remarks: '' },
          { dept: 'accounts',   cleared: false, by: '',            date: null,         remarks: 'Pending payment verification' },
          { dept: 'department', cleared: true,  by: 'HOD CSE',     date: '2024-10-07', remarks: '' },
          { dept: 'examCell',   cleared: false, by: '',            date: null,         remarks: '' },
        ]
      },
      {
        studentIdx: 3, appliedDate: '2024-09-20', status: 'complete',
        certGenerated: true, certDate: '2024-09-27',
        clearances: [
          { dept: 'library',    cleared: true, by: 'Librarian',  date: '2024-09-22', remarks: '' },
          { dept: 'hostel',     cleared: true, by: 'Warden',     date: '2024-09-23', remarks: '' },
          { dept: 'accounts',   cleared: true, by: 'Accountant', date: '2024-09-24', remarks: '' },
          { dept: 'department', cleared: true, by: 'HOD CSE',    date: '2024-09-25', remarks: '' },
          { dept: 'examCell',   cleared: true, by: 'Controller', date: '2024-09-26', remarks: '' },
        ]
      },
      {
        studentIdx: 6, appliedDate: '2024-10-10', status: 'pending',
        certGenerated: false, certDate: null,
        clearances: [
          { dept: 'library',    cleared: true,  by: 'Librarian',  date: '2024-10-12', remarks: '' },
          { dept: 'hostel',     cleared: false, by: '',           date: null,         remarks: 'Pending room inspection' },
          { dept: 'accounts',   cleared: true,  by: 'Accountant', date: '2024-10-13', remarks: '' },
          { dept: 'department', cleared: false, by: '',           date: null,         remarks: '' },
          { dept: 'examCell',   cleared: true,  by: 'Controller', date: '2024-10-14', remarks: '' },
        ]
      }
    ];

    for (const app of noDueData) {
      const res = await client.query(`
        INSERT INTO no_due_applications (student_id, applied_date, status, certificate_generated, certificate_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [ids[app.studentIdx], app.appliedDate, app.status, app.certGenerated, app.certDate]);

      const appId = res.rows[0].id;

      for (const c of app.clearances) {
        await client.query(`
          INSERT INTO no_due_clearances (application_id, department, cleared, cleared_by, cleared_date, remarks)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [appId, c.dept, c.cleared, c.by || null, c.date || null, c.remarks]);
      }
    }
    console.log('  ✅ Inserted no-due applications + clearances');

    await client.query('COMMIT');
    console.log('\n🎉 Database seeded successfully!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
};

seed();