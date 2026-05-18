import { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import Badge from '../common/Badge';
import DRCCApplicationModal from './DRCCApplicationModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { safeGetFromStorage } from '../../utils/storage';

const DRCCStudentsPage = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const students = safeGetFromStorage('students', []);
  const drccApplications = safeGetFromStorage('drccApplications', []);

  const drccStudents = useMemo(() => {
    return students.filter(s => s.isDRCC).map(student => {
      const application = drccApplications.find(app => app.studentId === student.id);
      return {
        ...student,
        application
      };
    });
  }, [students, drccApplications, refreshKey]);

  const filteredStudents = useMemo(() => {
    return drccStudents.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                            s.rollNo.includes(search) ||
                            s.uniRollNo.includes(search);

      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'applied' && s.application) ||
                           (filterStatus === 'not-applied' && !s.application) ||
                           (s.application && s.application.status === filterStatus);

      return matchesSearch && matchesStatus;
    });
  }, [drccStudents, search, filterStatus]);

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">DRCC Students</h1>
        <p className="text-gray-600 mt-1">Manage Deposit Refund Certificate & Clearance applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or roll number..."
          />

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="not-applied">Not Applied</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredStudents.length} of {drccStudents.length} DRCC students
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">{student.photo}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{student.fullName}</h3>
                  <p className="text-gray-600">{student.uniRollNo} • {student.department} • {student.year} Year</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {student.email} • {student.phone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {student.application ? (
                  <>
                    <Badge status={student.application.status} />
                    <p className="text-sm text-gray-600 mt-2">
                      Applied: {formatDate(student.application.appliedDate)}
                    </p>
                  </>
                ) : (
                  <Badge status="not-applied" label="Not Applied" />
                )}
              </div>
            </div>

            {student.application && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Caution Deposit</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(student.application.cautionDeposit)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Deductions</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(student.application.deductions)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Refundable Amount</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(student.application.refundableAmount)}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setSelectedApplication(student.application)}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                      View Application
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!student.application && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-600 text-center py-2">No application submitted yet</p>
              </div>
            )}
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No DRCC students found matching your criteria</p>
          </div>
        )}
      </div>

      <DRCCApplicationModal
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default DRCCStudentsPage;
