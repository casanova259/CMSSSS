import { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import Badge from '../common/Badge';
import DRCCApplicationModal from './DRCCApplicationModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { drccAPI } from '../../api';

const DRCCStudentsPage = () => {
  const [drccStudents, setDrccStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);

  const load = async () => {
    try {
      const apps = await drccAPI.getAll();
      setDrccStudents(apps);
    } catch (err) { console.error('Failed to load DRCC:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredStudents = useMemo(() => {
    return drccStudents.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search) || s.uniRollNo.includes(search);
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [drccStudents, search, filterStatus]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading DRCC students...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">DRCC Students</h1><p className="text-gray-600 mt-1">Manage Deposit Refund Certificate & Clearance applications</p></div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or roll number..." />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Showing {filteredStudents.length} of {drccStudents.length} DRCC applications</p>
          <button onClick={() => { setSearch(''); setFilterStatus('all'); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">Clear Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map(app => (
          <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">👨‍🎓</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{app.fullName}</h3>
                  <p className="text-gray-600">{app.uniRollNo} • {app.department} • {app.year} Year</p>
                  <p className="text-sm text-gray-500 mt-1">{app.email}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge status={app.status} />
                <p className="text-sm text-gray-600 mt-2">Applied: {formatDate(app.appliedDate)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Caution Deposit</p><p className="text-lg font-bold text-gray-800">{formatCurrency(app.cautionDeposit)}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Deductions</p><p className="text-lg font-bold text-red-600">{formatCurrency(app.deductions)}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Refundable Amount</p><p className="text-lg font-bold text-green-600">{formatCurrency(app.refundableAmount)}</p></div>
                <div className="flex items-center justify-center">
                  <button onClick={() => setSelectedApplication(app)} className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">View Application</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center"><FileText className="mx-auto text-gray-400 mb-4" size={48} /><p className="text-gray-600">No DRCC applications found</p></div>
        )}
      </div>

      <DRCCApplicationModal isOpen={selectedApplication !== null} onClose={() => setSelectedApplication(null)} application={selectedApplication} onUpdate={load} />
    </div>
  );
};

export default DRCCStudentsPage;
