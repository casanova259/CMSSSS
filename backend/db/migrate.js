require('dotenv').config();
const pool = require('./index');

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log('🚀 Running migrations...');

    await client.query('BEGIN');

    // ── Students ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id              SERIAL PRIMARY KEY,
        full_name       VARCHAR(150) NOT NULL,
        roll_no         VARCHAR(50)  UNIQUE NOT NULL,
        uni_roll_no     VARCHAR(50)  UNIQUE NOT NULL,
        department      VARCHAR(50)  NOT NULL,
        year            VARCHAR(10)  NOT NULL,
        semester        INTEGER      NOT NULL,
        email           VARCHAR(150) UNIQUE NOT NULL,
        phone           VARCHAR(15),
        hostel_room     VARCHAR(20),
        is_drcc         BOOLEAN      DEFAULT FALSE,
        photo           VARCHAR(10)  DEFAULT '👨‍🎓',
        bank_account    VARCHAR(30),
        ifsc_code       VARCHAR(20),
        bank_name       VARCHAR(50),
        created_at      TIMESTAMPTZ  DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  DEFAULT NOW()
      );
    `);
    console.log('  ✅ students table ready');

    // ── Fees ──────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id              SERIAL PRIMARY KEY,
        student_id      INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        fee_type        VARCHAR(50)  NOT NULL,   -- Tuition | Hostel | Exam
        amount          NUMERIC(10,2) NOT NULL,
        semester        VARCHAR(20),
        academic_year   VARCHAR(10),
        status          VARCHAR(20)  NOT NULL DEFAULT 'unpaid', -- paid | unpaid | partial
        due_date        DATE,
        paid_date       DATE,
        payment_mode    VARCHAR(30),             -- Online | Cash | Cheque
        transaction_id  VARCHAR(100),
        receipt_no      VARCHAR(50),
        remarks         TEXT,
        created_at      TIMESTAMPTZ  DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  DEFAULT NOW()
      );
    `);
    console.log('  ✅ fees table ready');

    // ── DRCC Applications ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS drcc_applications (
        id                SERIAL PRIMARY KEY,
        student_id        INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        caution_deposit   NUMERIC(10,2) DEFAULT 0,
        deductions        NUMERIC(10,2) DEFAULT 0,
        refundable_amount NUMERIC(10,2) DEFAULT 0,
        applied_date      DATE,
        status            VARCHAR(20)  DEFAULT 'pending',   -- pending | approved | rejected
        processed_date    DATE,
        processed_by      VARCHAR(100),
        rejection_reason  TEXT,
        documents         TEXT[],                           -- array of filenames
        comments          TEXT,
        created_at        TIMESTAMPTZ  DEFAULT NOW(),
        updated_at        TIMESTAMPTZ  DEFAULT NOW()
      );
    `);
    console.log('  ✅ drcc_applications table ready');

    // ── No-Due Applications ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS no_due_applications (
        id                    SERIAL PRIMARY KEY,
        student_id            INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        applied_date          DATE,
        status                VARCHAR(20) DEFAULT 'pending',  -- pending | complete
        certificate_generated BOOLEAN DEFAULT FALSE,
        certificate_date      DATE,
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        updated_at            TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('  ✅ no_due_applications table ready');

    // ── No-Due Clearances (one row per department per application) ─
    await client.query(`
      CREATE TABLE IF NOT EXISTS no_due_clearances (
        id              SERIAL PRIMARY KEY,
        application_id  INTEGER     NOT NULL REFERENCES no_due_applications(id) ON DELETE CASCADE,
        department      VARCHAR(50) NOT NULL,  -- library | hostel | accounts | department | examCell
        cleared         BOOLEAN     DEFAULT FALSE,
        cleared_by      VARCHAR(100),
        cleared_date    DATE,
        remarks         TEXT,
        UNIQUE (application_id, department)
      );
    `);
    console.log('  ✅ no_due_clearances table ready');

    // ── Updated_at auto-trigger ───────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    for (const tbl of ['students', 'fees', 'drcc_applications', 'no_due_applications']) {
      await client.query(`
        DROP TRIGGER IF EXISTS set_updated_at ON ${tbl};
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON ${tbl}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `);
    }
    console.log('  ✅ auto updated_at triggers set');

    await client.query('COMMIT');
    console.log('\n✅ All migrations completed successfully!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
