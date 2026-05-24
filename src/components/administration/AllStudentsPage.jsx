import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Badge from '../common/Badge';
import StudentDetailsModal from './StudentDetailsModal';
import StudentFormModal from './StudentFormModal';
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
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);   // null = closed, {} = add, student = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');

  const ITEMS_PER_PAGE = 12;

  const loadData = async () => {
    try {
      const [s, f] = await Promise.all([studentsAPI.getAll(), feesAPI.getAll()]);
      setStudents(s);
      setFees(f);
    } catch (err) { console.error('Failed to load:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await studentsAPI.delete(deleteTarget.id);
      showToast(`${deleteTarget.fullName} deleted successfully`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast('Failed to delete student');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = s.fullName.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.uniRollNo.toLowerCase().includes(q);
      const matchDept = filterDept === 'all' || s.department === filterDept;
      const matchYear = filterYear === 'all' || s.year === filterYear;
      const hasUnpaid = fees.some(f => f.studentId === s.id && f.status === 'unpaid');
      const matchPayment = filterPayment === 'all' || (filterPayment === 'paid' && !hasUnpaid) || (filterPayment === 'unpaid' && hasUnpaid);
      const matchHostel = filterHostel === 'all' || (filterHostel === 'hostel' && s.hostelRoom) || (filterHostel === 'day' && !s.hostelRoom);
      return matchSearch && matchDept && matchYear && matchPayment && matchHostel;
    });
  }, [students, fees, search, filterDept, filterYear, filterPayment, filterHostel]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginated = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPaymentStatus = (studentId) =>
    fees.some(f => f.studentId === studentId && f.status === 'unpaid') ? 'unpaid' : 'paid';

  const clearFilters = () => { setSearch(''); setFilterDept('all'); setFilterYear('all'); setFilterPayment('all'); setFilterHostel('all'); setCurrentPage(1); };

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
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Students</h1>
          <p className="text-gray-500 mt-1">{students.length} students in database</p>
        </div>
        <button
          onClick={() => setEditStudent({})}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, roll no, or university roll no..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Department', value: filterDept, onChange: setFilterDept, options: [['all', 'All Departments'], ['CSE', 'CSE'], ['ECE', 'ECE'], ['ME', 'ME'], ['CE', 'CE']] },
            { label: 'Year', value: filterYear, onChange: setFilterYear, options: [['all', 'All Years'], ['1st', '1st Year'], ['2nd', '2nd Year'], ['3rd', '3rd Year'], ['4th', '4th Year']] },
            { label: 'Payment', value: filterPayment, onChange: setFilterPayment, options: [['all', 'All Status'], ['paid', 'Paid'], ['unpaid', 'Unpaid']] },
            { label: 'Hostel', value: filterHostel, onChange: setFilterHostel, options: [['all', 'All Students'], ['hostel', 'Hostel'], ['day', 'Day Scholar']] },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
              <select value={f.value} onChange={e => { f.onChange(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none">
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">{paginated.length}</span> of <span className="font-semibold text-gray-700">{filteredStudents.length}</span> students</p>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline font-medium">Clear filters</button>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
        {paginated.map(student => (
          <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col">
            {/* Card body — clickable to view */}
            <div className="p-5 flex-1 cursor-pointer" onClick={() => setViewStudent(student)}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-4xl">{student.photo}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{student.fullName}</h3>
                  <p className="text-xs text-gray-400 truncate">{student.uniRollNo}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Dept</span><span className="font-medium">{student.department}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Year</span><span className="font-medium">{student.year}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Hostel</span><span className="font-medium">{student.hostelRoom || 'Day Scholar'}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Fees</span><Badge status={getPaymentStatus(student.id)} /></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setEditStudent(student)}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium rounded-bl-xl"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => setDeleteTarget(student)}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium rounded-br-xl"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No students found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm font-medium">← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{p}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm font-medium">Next →</button>
        </div>
      )}

      {/* View Details Modal */}
      <StudentDetailsModal isOpen={viewStudent !== null} onClose={() => setViewStudent(null)} student={viewStudent} />

      {/* Add / Edit Modal */}
      <StudentFormModal
        isOpen={editStudent !== null}
        onClose={() => setEditStudent(null)}
        student={editStudent && Object.keys(editStudent).length > 0 ? editStudent : null}
        onSaved={() => { showToast(editStudent && Object.keys(editStudent).length > 0 ? 'Student updated successfully!' : 'Student added successfully!'); loadData(); }}
      />

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">{deleteTarget.photo}</div>
              <h3 className="text-xl font-bold text-gray-800">Delete Student?</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteTarget.fullName}</span>?
                <br />This will also delete all their fee records and cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                {deleteLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Deleting...</span></> : <><Trash2 size={16} /><span>Delete</span></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllStudentsPage;