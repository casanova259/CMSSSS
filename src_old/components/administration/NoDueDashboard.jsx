import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import NoDueDetailsModal from './NoDueDetailsModal';
import { noDueAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

const NoDueDashboard = () => {
  const [noDueApplications, setNoDueApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const departments = ['CSE', 'ECE', 'ME', 'CE'];

  const load = async () => {
    try {
      const apps = await noDueAPI.getAll();
      setNoDueApplications(apps);
    } catch (err) { console.error('Failed to load no-due:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deptSummary = useMemo(() => {
    return departments.map(dept => {
      const deptApps = noDueApplications.filter(app => app.department === dept);
      const cleared = deptApps.filter(a => a.status === 'complete').length;
      return { department: dept, total: deptApps.length, cleared, pending: deptApps.length - cleared, percentage: deptApps.length > 0 ? ((cleared / deptApps.length) * 100).toFixed(1) : 0 };
    });
  }, [noDueApplications]);

  const getClearanceIcon = (clearance) => {
    if (!clearance) return <Clock className="text-yellow-500" size={20} />;
    if (clearance.cleared) return <CheckCircle className="text-green-500" size={20} />;
    if (clearance.remarks) return <XCircle className="text-red-500" size={20} />;
    return <Clock className="text-yellow-500" size={20} />;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-500">Loading no-due applications...</p></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">No Due Dashboard</h1><p className="text-gray-600 mt-1">Track clearance status for graduating students</p></div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Department-wise Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Department','Total Students','Cleared','Pending','Completion %'].map(h => <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {deptSummary.map(dept => (
                <tr key={dept.department} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">{dept.total}</td>
                  <td className="px-6 py-4 text-sm text-green-600 text-center font-medium">{dept.cleared}</td>
                  <td className="px-6 py-4 text-sm text-yellow-600 text-center font-medium">{dept.pending}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${dept.percentage}%` }}></div></div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">{dept.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Individual Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Student Name','Roll No','Department','Library','Hostel','Accounts','Department','Exam Cell','Status','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {noDueApplications.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{app.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.department}</td>
                  <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances?.library)}</td>
                  <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances?.hostel)}</td>
                  <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances?.accounts)}</td>
                  <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances?.department)}</td>
                  <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances?.examCell)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'complete' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                      {app.status === 'complete' ? 'Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4"><button onClick={() => setSelectedApplication(app)} className="text-blue-500 hover:text-blue-600"><Eye size={20} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {noDueApplications.length === 0 && <div className="text-center py-12 text-gray-500"><p>No no-due applications found</p></div>}
        </div>
      </div>

      <NoDueDetailsModal isOpen={selectedApplication !== null} onClose={() => setSelectedApplication(null)} application={selectedApplication} onUpdate={load} />
    </div>
  );
};

export default NoDueDashboard;
