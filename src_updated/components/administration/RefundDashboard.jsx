import { useState, useEffect, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import Badge from '../common/Badge';
import DRCCApplicationModal from './DRCCApplicationModal';
import Toast from '../common/Toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { drccAPI } from '../../api';

const RefundDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  const load = async () => {
    try {
      const apps = await drccAPI.getAll();
      setApplications(apps);
    } catch (err) { console.error('Failed to load refunds:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredApplications = useMemo(() => activeTab === 'all' ? applications : applications.filter(a => a.status === activeTab), [applications, activeTab]);
  const tabCounts = useMemo(() => ({ pending: applications.filter(a => a.status === 'pending').length, approved: applications.filter(a => a.status === 'approved').length, rejected: applications.filter(a => a.status === 'rejected').length, all: applications.length }), [applications]);

  const bulkApprove = async () => {
    try {
      await Promise.all(selectedIds.map(id => drccAPI.approve(id, 'Admin', 'Bulk approved')));
      setToast({ message: `${selectedIds.length} applications approved`, type: 'success' });
      setSelectedIds([]);
      load();
    } catch { setToast({ message: 'Failed to approve', type: 'error' }); }
  };

  const bulkReject = async () => {
    try {
      await Promise.all(selectedIds.map(id => drccAPI.reject(id, 'Admin', 'Bulk rejection')));
      setToast({ message: `${selectedIds.length} applications rejected`, type: 'error' });
      setSelectedIds([]);
      load();
    } catch { setToast({ message: 'Failed to reject', type: 'error' }); }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Roll No', 'Department', 'Amount', 'Applied Date', 'Status'];
    const rows = filteredApplications.map(app => [app.fullName, app.uniRollNo, app.department, app.refundableAmount, app.appliedDate, app.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'refund-applications.csv'; a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-500">Loading refunds...</p></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">Refund Application Dashboard</h1><p className="text-gray-600 mt-1">Manage and process DRCC refund applications</p></div>
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b">
          <div className="flex space-x-1 p-2">
            {[['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === key ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {label} <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === key ? 'bg-white text-blue-500' : 'bg-gray-200'}`}>{tabCounts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 && activeTab === 'pending' && (
          <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
            <span className="text-blue-800 font-medium">{selectedIds.length} application(s) selected</span>
            <div className="flex space-x-2">
              <button onClick={bulkApprove} className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"><CheckCircle size={16} /><span>Approve Selected</span></button>
              <button onClick={bulkReject} className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"><XCircle size={16} /><span>Reject Selected</span></button>
            </div>
          </div>
        )}

        <div className="p-4 flex justify-between items-center border-b">
          <p className="text-sm text-gray-600">Showing {filteredApplications.length} applications</p>
          <button onClick={exportToCSV} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"><Download size={16} /><span>Export to CSV</span></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'pending' && <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0} onChange={e => setSelectedIds(e.target.checked ? filteredApplications.map(a => a.id) : [])} className="rounded" /></th>}
                {['Student Name','Roll No','Department','Year','Amount','Applied Date','Status','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  {activeTab === 'pending' && <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() => setSelectedIds(prev => prev.includes(app.id) ? prev.filter(i => i !== app.id) : [...prev, app.id])} className="rounded" /></td>}
                  <td className="px-6 py-4 text-sm text-gray-900">{app.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.uniRollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(app.refundableAmount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(app.appliedDate)}</td>
                  <td className="px-6 py-4"><Badge status={app.status} /></td>
                  <td className="px-6 py-4"><button onClick={() => setSelectedApplication(app)} className="text-blue-500 hover:text-blue-600"><Eye size={20} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApplications.length === 0 && <div className="text-center py-12 text-gray-500"><p>No applications found</p></div>}
        </div>
      </div>

      <DRCCApplicationModal isOpen={selectedApplication !== null} onClose={() => setSelectedApplication(null)} application={selectedApplication} onUpdate={load} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RefundDashboard;
