import { useState, useEffect } from 'react';
import { Mail, Phone, Home, CreditCard, Pencil, Trash2, X } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { feesAPI } from '../../api';

const StudentDetailsModal = ({ isOpen, onClose, student, onEdit, onDelete }) => {
  const [fees, setFees]         = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load fees from API whenever the modal opens for a student
  useEffect(() => {
    if (!isOpen || !student) return;
    setConfirmDelete(false);
    setLoadingFees(true);
    feesAPI
      .getByStudent(student.id)
      .then(setFees)
      .catch(() => setFees([]))
      .finally(() => setLoadingFees(false));
  }, [isOpen, student]);

  if (!student) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(student.id);   // caller handles the actual API call + state update
      onClose();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" size="lg">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="text-6xl">{student.photo}</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{student.fullName}</h3>
              <p className="text-gray-500 text-sm">{student.uniRollNo} • {student.rollNo}</p>
              <p className="text-gray-500 text-sm">
                {student.department} • {student.year} Year • Semester {student.semester}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { onClose(); onEdit(student); }}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Pencil size={15} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* ── Delete confirmation ── */}
        {confirmDelete && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium mb-1">Delete this student?</p>
            <p className="text-red-600 text-sm mb-3">
              This will permanently delete <strong>{student.fullName}</strong> and all their fee records. This cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Contact info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Mail,      label: 'Email',       value: student.email },
            { icon: Phone,     label: 'Phone',       value: student.phone || '—' },
            { icon: Home,      label: 'Hostel Room', value: student.hostelRoom || 'Day Scholar' },
            { icon: CreditCard, label: 'DRCC Eligible', value: student.isDRCC ? 'Yes' : 'No' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Icon className="text-gray-400 flex-shrink-0" size={18} />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bank details ── */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Bank Name',      value: student.bankName    || '—' },
              { label: 'Account Number', value: student.bankAccount || '—' },
              { label: 'IFSC Code',      value: student.ifscCode    || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fee history ── */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Fee History</h4>

          {loadingFees ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : fees.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No fee records found</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {['Fee Type', 'Semester', 'Amount', 'Status', 'Due Date', 'Paid Date'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fees.map(fee => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{fee.feeType}</td>
                      <td className="px-4 py-2">{fee.semester ?? '—'}</td>
                      <td className="px-4 py-2 font-medium">{formatCurrency(fee.amount)}</td>
                      <td className="px-4 py-2"><Badge status={fee.status} /></td>
                      <td className="px-4 py-2 text-gray-500">{formatDate(fee.dueDate)}</td>
                      <td className="px-4 py-2 text-gray-500">{fee.paidDate ? formatDate(fee.paidDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default StudentDetailsModal;