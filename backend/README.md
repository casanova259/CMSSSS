# College Admin System — Backend Setup Guide

## Stack
- **Backend**: Node.js + Express
- **Database**: Neon PostgreSQL (serverless)
- **Frontend**: React (Vite)

---

## Step 1 — Get Your Neon Connection String

1. Go to **[neon.tech](https://neon.tech)** and sign in (free tier works perfectly)
2. Create a new project → name it `college-admin`
3. On the dashboard, click **"Connection string"**
4. Copy the full string — it looks like:
   ```
   postgresql://alex:password@ep-cool-name-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2 — Configure Environment

```bash
# In the backend/ folder:
cp .env.example .env
```

Open `.env` and paste your Neon connection string:
```env
DATABASE_URL=postgresql://your-connection-string-here?sslmode=require
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Step 3 — Install & Run

```bash
# Install dependencies
cd backend
npm install

# Create all tables in Neon
npm run db:migrate

# Seed with sample data (your existing mock data)
npm run db:seed

# Start the server
npm run dev
```

You should see:
```
✅ Connected to Neon PostgreSQL at: 2024-...
🚀 College Admin API running on http://localhost:5000
```

---

## Step 4 — Configure Frontend

In your React project root, create or edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Then copy `frontend-api.js` into your `src/` folder:
```bash
cp frontend-api.js ../your-react-app/src/api.js
```

---

## Step 5 — Replace localStorage Calls in React

Before (localStorage):
```js
const students = JSON.parse(localStorage.getItem('students')) || [];
```

After (real DB):
```js
import { studentsAPI } from './api';

// In a useEffect or React Query:
const students = await studentsAPI.getAll();
```

### Common patterns:

```js
import { studentsAPI, feesAPI, drccAPI, noDueAPI } from './api';

// Get all students
const students = await studentsAPI.getAll();

// Filter by department
const cseStudents = await studentsAPI.getAll({ department: 'CSE' });

// Get fees for a student
const fees = await feesAPI.getByStudent(studentId);

// Mark fee as paid
await feesAPI.markPaid(feeId, {
  paymentMode: 'Online',
  transactionId: 'TXN999',
  receiptNo: 'REC099'
});

// Approve DRCC
await drccAPI.approve(applicationId, 'Admin', 'Verified');

// Update no-due clearance
await noDueAPI.updateClearance(appId, 'library', {
  cleared: true,
  clearedBy: 'Librarian',
  remarks: 'All books returned'
});
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | All students (filter: `?department=CSE&year=4th&search=rahul`) |
| GET | `/api/students/:id` | Single student |
| POST | `/api/students` | Add student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/fees` | All fees (filter: `?studentId=1&status=unpaid`) |
| GET | `/api/fees/student/:id` | Fees for one student |
| GET | `/api/fees/stats/summary` | Paid/unpaid totals |
| POST | `/api/fees` | Add fee record |
| PUT | `/api/fees/:id` | Update fee (mark paid etc.) |
| GET | `/api/drcc` | All DRCC applications |
| POST | `/api/drcc` | New DRCC application |
| PUT | `/api/drcc/:id` | Approve/reject application |
| GET | `/api/no-due` | All no-due applications |
| POST | `/api/no-due` | New no-due application |
| PUT | `/api/no-due/:id/clearance/:dept` | Update department clearance |
| PUT | `/api/no-due/:id/certificate` | Generate certificate |
| GET | `/api/health` | Health check |

---

## Folder Structure

```
backend/
├── server.js          ← Express entry point
├── .env               ← Your secrets (DO NOT commit)
├── .env.example       ← Template to share
├── package.json
├── db/
│   ├── index.js       ← Neon connection pool
│   ├── migrate.js     ← Creates all tables
│   └── seed.js        ← Inserts sample data
└── routes/
    ├── students.js
    ├── fees.js
    ├── drcc.js
    └── nodue.js

src/ (your React app)
└── api.js             ← Frontend API client (copy frontend-api.js here)
```

---

## Deploying to Production

When you deploy the backend (Railway, Render, etc.):
1. Add `DATABASE_URL` as an environment variable
2. Update `CLIENT_URL` to your deployed frontend URL
3. Update `VITE_API_URL` in your frontend `.env.production`
