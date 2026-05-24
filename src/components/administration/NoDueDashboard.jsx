import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react';
import NoDueDetailsModal from './NoDueDetailsModal';
import { noDueAPI, studentsAPI, feesAPI } from '../../api';

const DEPT_LIST = ['CSE', 'ECE', 'ME', 'CE'];
const CLEARANCE_KEYS = ['library', 'hostel', 'accounts', 'department', 'examCell'];
const CLEARANCE_LABELS = ['Library', 'Hostel', 'Accounts', 'Dept', 'Exam Cell'];

const NoDueDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const load = async () => {
    try {
      const apps = await noDueAPI.getAll();
      setApplications(apps);
    } catch (err) { console.error('Failed to load no-due:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Sync all students: create no-due if missing, auto-clear accounts if fees paid ──
  const syncAllStudents = async () => {
    setSyncing(true);
    try {
      const [students, fees, existingApps] = await Promise.all([
        studentsAPI.getAll(),
        feesAPI.getAll(),
        noDueAPI.getAll(),
      ]);

      const existingStudentIds = new Set(existingApps.map(a => a.studentId));

      for (const student of students) {
        let app;

        // Create no-due if doesn't exist
        if (!existingStudentIds.has(student.id)) {
          await noDueAPI.create(student.id);
          // Reload to get the new app id
          const refreshed = await noDueAPI.getAll();
          app = refreshed.find(a => a.studentId === student.id);
        } else {
          app = existingApps.find(a => a.studentId === student.id);
        }

        if (!app) continue;

        // Auto-clear accounts if all fees are paid
        const studentFees = fees.filter(f => f.studentId === student.id);
        const hasUnpaid = studentFees.some(f => f.status === 'unpaid');
        const accountsClearance = app.clearances?.accounts;

        if (!hasUnpaid && studentFees.length > 0 && !accountsClearance?.cleared) {
          await noDueAPI.updateClearance(app.id, 'accounts', {
            cleared: true,
            clearedBy: 'Accounts Dept (Auto)',
            remarks: 'All fees verified paid',
          });
        }
      }

      await load();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const deptSummary = useMemo(() => {
    return DEPT_LIST.map(dept => {
      const deptApps = applications.filter(a => a.department === dept);
      const cleared = deptApps.filter(a => a.status === 'complete').length;
      return {
        department: dept,
        total: deptApps.length,
        cleared,
        pending: deptApps.length - cleared,
        percentage: deptApps.length > 0 ? ((cleared / deptApps.length) * 100).toFixed(1) : 0,
      };
    });
  }, [applications]);

  const getClearanceIcon = (clearance) => {
    if (!clearance) return <Clock className="text-yellow-500 mx-auto" size={18} />;
    if (clearance.cleared) return <CheckCircle className="text-green-500 mx-auto" size={18} />;
    if (clearance.remarks) return <XCircle className="text-red-400 mx-auto" size={18} />;
    return <Clock className="text-yellow-500 mx-auto" size={18} />;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading no-due applications...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">No Due Dashboard</h1>
          <p className="text-gray-600 mt-1">{applications.length} students tracked</p>
        </div>
        <button
          onClick={syncAllStudents}
          disabled={syncing}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync All Students'}</span>
        </button>
      </div>

      {/* Sync hint */}
      {applications.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-center">
          <p className="text-blue-800 font-medium">No applications yet</p>
          <p className="text-blue-600 text-sm mt-1">Click <strong>Sync All Students</strong> to create no-due applications for all students and auto-clear accounts for those who have paid their fees.</p>
        </div>
      )}

      {/* Department Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Department-wise Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Department', 'Total', 'Cleared', 'Pending', 'Progress'].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-left text-sm font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptSummary.map(dept => (
                <tr key={dept.department} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{dept.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{dept.total}</td>
                  <td className="px-6 py-4 text-sm text-green-600 text-center font-medium">{dept.cleared}</td>
                  <td className="px-6 py-4 text-sm text-yellow-600 text-center font-medium">{dept.pending}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${dept.percentage}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-10">{dept.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">All Student Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Roll No', 'Dept', ...CLEARANCE_LABELS, 'Status', ''].map((h, i) => (
                  <th key={i} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-800">{app.fullName}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{app.rollNo}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{app.department}</td>
                  {CLEARANCE_KEYS.map(key => (
                    <td key={key} className="px-3 py-3 text-center">
                      {getClearanceIcon(app.clearances?.[key])}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'complete'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status === 'complete' ? '✅ Done' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {applications.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No applications yet — click Sync All Students above</p>
            </div>
          )}
        </div>
      </div>

      <NoDueDetailsModal
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onUpdate={() => { load(); setSelectedApplication(null); }}
      />
    </div>
  );
};

export default NoDueDashboard;