import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import NoDueDetailsModal from './NoDueDetailsModal';
import { safeGetFromStorage, getStudentById } from '../../utils/storage';
import { formatDate } from '../../utils/formatters';

const NoDueDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const students = safeGetFromStorage('students', []);
  const noDueApplications = safeGetFromStorage('noDueApplications', []);

  const departments = ['CSE', 'ECE', 'ME', 'CE'];

  const deptSummary = useMemo(() => {
    return departments.map(dept => {
      const deptStudents = students.filter(s => s.department === dept && s.year === '4th');
      const deptApplications = noDueApplications.filter(app => {
        const student = getStudentById(app.studentId);
        return student && student.department === dept;
      });
      const cleared = deptApplications.filter(a => a.status === 'complete').length;

      return {
        department: dept,
        total: deptStudents.length,
        cleared,
        pending: deptStudents.length - cleared,
        percentage: deptStudents.length > 0 ? ((cleared / deptStudents.length) * 100).toFixed(1) : 0
      };
    });
  }, [students, noDueApplications, refreshKey]);

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getClearanceIcon = (clearance) => {
    if (clearance.cleared) return <CheckCircle className="text-green-500" size={20} />;
    if (clearance.remarks) return <XCircle className="text-red-500" size={20} />;
    return <Clock className="text-yellow-500" size={20} />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">No Due Dashboard</h1>
        <p className="text-gray-600 mt-1">Track clearance status for graduating students</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Department-wise Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total Students</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Cleared</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Pending</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Completion %</th>
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
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {dept.percentage}%
                      </span>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Library</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hostel</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Accounts</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Exam Cell</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {noDueApplications.map(app => {
                const student = getStudentById(app.studentId);
                if (!student) return null;

                return (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.uniRollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.department}</td>
                    <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances.library)}</td>
                    <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances.hostel)}</td>
                    <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances.accounts)}</td>
                    <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances.department)}</td>
                    <td className="px-6 py-4 text-center">{getClearanceIcon(app.clearances.examCell)}</td>
                    <td className="px-6 py-4">
                      {app.status === 'complete' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          Complete
                        </span>
                      ) : app.status === 'issues' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          Issues
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pending
                        </span>
                      )}
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

          {noDueApplications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No no-due applications found</p>
            </div>
          )}
        </div>
      </div>

      <NoDueDetailsModal
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default NoDueDashboard;
