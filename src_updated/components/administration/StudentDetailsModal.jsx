import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { safeGetFromStorage } from '../../utils/storage';
import { Mail, Phone, Home, CreditCard, Building } from 'lucide-react';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!student) return null;

  const fees = safeGetFromStorage('fees', []).filter(f => f.studentId === student.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="text-6xl">{student.photo}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{student.fullName}</h3>
            <p className="text-gray-600">{student.uniRollNo} • {student.rollNo}</p>
            <p className="text-gray-600">{student.department} • {student.year} Year • Semester {student.semester}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="text-gray-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="text-gray-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">{student.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Home className="text-gray-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Hostel Room</p>
              <p className="text-sm font-medium">{student.hostelRoom || 'Day Scholar'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="text-gray-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">DRCC Eligible</p>
              <p className="text-sm font-medium">{student.isDRCC ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Bank Name</p>
              <p className="text-sm font-medium">{student.bankName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Account Number</p>
              <p className="text-sm font-medium">{student.bankAccount}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">IFSC Code</p>
              <p className="text-sm font-medium">{student.ifscCode}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Fee History</h4>
          <div className="space-y-2">
            {fees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No fee records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Fee Type</th>
                      <th className="px-4 py-2 text-left">Semester</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map(fee => (
                      <tr key={fee.id} className="border-b">
                        <td className="px-4 py-2">{fee.feeType}</td>
                        <td className="px-4 py-2">{fee.semester}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(fee.amount)}</td>
                        <td className="px-4 py-2">
                          <Badge status={fee.status} />
                        </td>
                        <td className="px-4 py-2">{formatDate(fee.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
