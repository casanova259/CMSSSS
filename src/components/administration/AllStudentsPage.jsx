import { useState, useMemo } from 'react';
import { User } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import Badge from '../common/Badge';
import StudentDetailsModal from './StudentDetailsModal';
import { safeGetFromStorage } from '../../utils/storage';

const AllStudentsPage = () => {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const students = safeGetFromStorage('students', []);
  const fees = safeGetFromStorage('fees', []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                            s.rollNo.includes(search) ||
                            s.uniRollNo.includes(search);
      const matchesDept = filterDept === 'all' || s.department === filterDept;
      const matchesYear = filterYear === 'all' || s.year === filterYear;

      const studentFees = fees.filter(f => f.studentId === s.id);
      const hasUnpaid = studentFees.some(f => f.status === 'unpaid');
      const matchesPayment = filterPayment === 'all' ||
                             (filterPayment === 'paid' && !hasUnpaid) ||
                             (filterPayment === 'unpaid' && hasUnpaid);

      const matchesHostel = filterHostel === 'all' ||
                           (filterHostel === 'hostel' && s.hostelRoom) ||
                           (filterHostel === 'day' && !s.hostelRoom);

      return matchesSearch && matchesDept && matchesYear && matchesPayment && matchesHostel;
    });
  }, [students, fees, search, filterDept, filterYear, filterPayment, filterHostel]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setFilterDept('all');
    setFilterYear('all');
    setFilterPayment('all');
    setFilterHostel('all');
    setCurrentPage(1);
  };

  const getPaymentStatus = (studentId) => {
    const studentFees = fees.filter(f => f.studentId === studentId);
    const hasUnpaid = studentFees.some(f => f.status === 'unpaid');
    return hasUnpaid ? 'unpaid' : 'paid';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Students</h1>
        <p className="text-gray-600 mt-1">View and manage student records</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or roll number..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hostel Status</label>
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="hostel">Hostel</option>
              <option value="day">Day Scholar</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {paginatedStudents.length} of {filteredStudents.length} students
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {paginatedStudents.map(student => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-4xl">{student.photo}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{student.fullName}</h3>
                <p className="text-sm text-gray-600 truncate">{student.uniRollNo}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{student.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{student.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hostel:</span>
                <span className="font-medium">{student.hostelRoom || 'Day Scholar'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment:</span>
                <Badge status={getPaymentStatus(student.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <StudentDetailsModal
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
      />
    </div>
  );
};

export default AllStudentsPage;
