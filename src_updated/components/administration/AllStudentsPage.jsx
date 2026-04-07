import { useState, useEffect, useMemo } from 'react';
import { User } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import Badge from '../common/Badge';
import StudentDetailsModal from './StudentDetailsModal';
import { studentsAPI, feesAPI } from '../../api';

const AllStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterHostel, setFilterHostel] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const load = async () => {
      try {
        const [s, f] = await Promise.all([studentsAPI.getAll(), feesAPI.getAll()]);
        setStudents(s);
        setFees(f);
      } catch (err) { console.error('Failed to load students:', err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search) || s.uniRollNo.includes(search);
      const matchesDept = filterDept === 'all' || s.department === filterDept;
      const matchesYear = filterYear === 'all' || s.year === filterYear;
      const studentFees = fees.filter(f => f.studentId === s.id);
      const hasUnpaid = studentFees.some(f => f.status === 'unpaid');
      const matchesPayment = filterPayment === 'all' || (filterPayment === 'paid' && !hasUnpaid) || (filterPayment === 'unpaid' && hasUnpaid);
      const matchesHostel = filterHostel === 'all' || (filterHostel === 'hostel' && s.hostelRoom) || (filterHostel === 'day' && !s.hostelRoom);
      return matchesSearch && matchesDept && matchesYear && matchesPayment && matchesHostel;
    });
  }, [students, fees, search, filterDept, filterYear, filterPayment, filterHostel]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const clearFilters = () => { setSearch(''); setFilterDept('all'); setFilterYear('all'); setFilterPayment('all'); setFilterHostel('all'); setCurrentPage(1); };
  const getPaymentStatus = (studentId) => fees.filter(f => f.studentId === studentId).some(f => f.status === 'unpaid') ? 'unpaid' : 'paid';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading students...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-800">All Students</h1><p className="text-gray-600 mt-1">View and manage student records</p></div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or roll number..." /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Department', value: filterDept, onChange: setFilterDept, options: [['all','All Departments'],['CSE','CSE'],['ECE','ECE'],['ME','ME'],['CE','CE']] },
            { label: 'Year', value: filterYear, onChange: setFilterYear, options: [['all','All Years'],['1st','1st Year'],['2nd','2nd Year'],['3rd','3rd Year'],['4th','4th Year']] },
            { label: 'Payment Status', value: filterPayment, onChange: setFilterPayment, options: [['all','All Status'],['paid','Paid'],['unpaid','Unpaid']] },
            { label: 'Hostel Status', value: filterHostel, onChange: setFilterHostel, options: [['all','All Students'],['hostel','Hostel'],['day','Day Scholar']] },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
              <select value={f.value} onChange={e => f.onChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Showing {paginatedStudents.length} of {filteredStudents.length} students</p>
          <button onClick={clearFilters} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">Clear Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {paginatedStudents.map(student => (
          <div key={student.id} onClick={() => setSelectedStudent(student)} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-4xl">{student.photo}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{student.fullName}</h3>
                <p className="text-sm text-gray-600 truncate">{student.uniRollNo}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Department:</span><span className="font-medium">{student.department}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Year:</span><span className="font-medium">{student.year}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Hostel:</span><span className="font-medium">{student.hostelRoom || 'Day Scholar'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Payment:</span><Badge status={getPaymentStatus(student.id)} /></div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <span className="px-4 py-2 text-gray-700">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      )}

      <StudentDetailsModal isOpen={selectedStudent !== null} onClose={() => setSelectedStudent(null)} student={selectedStudent} />
    </div>
  );
};

export default AllStudentsPage;
