import { useState, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import Badge from '../common/Badge';
import DRCCApplicationModal from './DRCCApplicationModal';
import Toast from '../common/Toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { safeGetFromStorage, safeSetToStorage, getStudentById } from '../../utils/storage';

const RefundDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const applications = safeGetFromStorage('drccApplications', []);

  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') return applications;
    return applications.filter(app => app.status === activeTab);
  }, [applications, activeTab, refreshKey]);

  const tabCounts = useMemo(() => {
    return {
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      all: applications.length
    };
  }, [applications, refreshKey]);

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedIds([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredApplications.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkApprove = () => {
    const apps = safeGetFromStorage('drccApplications', []);
    const updated = apps.map(a =>
      selectedIds.includes(a.id) && a.status === 'pending'
        ? { ...a, status: 'approved', processedDate: new Date().toISOString(), processedBy: 'Admin' }
        : a
    );
    safeSetToStorage('drccApplications', updated);
    setToast({ message: `${selectedIds.length} applications approved`, type: 'success' });
    handleUpdate();
  };

  const bulkReject = () => {
    const apps = safeGetFromStorage('drccApplications', []);
    const updated = apps.map(a =>
      selectedIds.includes(a.id) && a.status === 'pending'
        ? {
            ...a,
            status: 'rejected',
            processedDate: new Date().toISOString(),
            processedBy: 'Admin',
            rejectionReason: 'Bulk rejection'
          }
        : a
    );
    safeSetToStorage('drccApplications', updated);
    setToast({ message: `${selectedIds.length} applications rejected`, type: 'error' });
    handleUpdate();
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Roll No', 'Department', 'Amount', 'Applied Date', 'Status'];
    const rows = filteredApplications.map(app => {
      const student = getStudentById(app.studentId);
      return [
        student?.fullName || 'Unknown',
        student?.uniRollNo || 'N/A',
        student?.department || 'N/A',
        app.refundableAmount,
        app.appliedDate,
        app.status
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refund-applications.csv';
    a.click();
  };

  const tabs = [
    { key: 'pending', label: 'Pending', count: tabCounts.pending },
    { key: 'approved', label: 'Approved', count: tabCounts.approved },
    { key: 'rejected', label: 'Rejected', count: tabCounts.rejected },
    { key: 'all', label: 'All', count: tabCounts.all }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Refund Application Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and process DRCC refund applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b">
          <div className="flex space-x-1 p-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white text-blue-500' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 && activeTab === 'pending' && (
          <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedIds.length} application(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={bulkApprove}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <CheckCircle size={16} />
                <span>Approve Selected</span>
              </button>
              <button
                onClick={bulkReject}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <XCircle size={16} />
                <span>Reject Selected</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-4 flex justify-between items-center border-b">
          <p className="text-sm text-gray-600">
            Showing {filteredApplications.length} applications
          </p>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download size={16} />
            <span>Export to CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applied Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => {
                const student = getStudentById(app.studentId);
                if (!student) return null;

                return (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => handleSelectOne(app.id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.uniRollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(app.refundableAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(app.appliedDate)}</td>
                    <td className="px-6 py-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No applications found</p>
            </div>
          )}
        </div>
      </div>

      <DRCCApplicationModal
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onUpdate={handleUpdate}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RefundDashboard;
