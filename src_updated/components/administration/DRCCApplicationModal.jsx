import { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Toast from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { safeGetFromStorage, safeSetToStorage, getStudentById } from '../../utils/storage';
import { Download, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const DRCCApplicationModal = ({ isOpen, onClose, application, onUpdate }) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState(null);

  if (!application) return null;

  const student = getStudentById(application.studentId);
  if (!student) return null;

  const approveApplication = () => {
    const apps = safeGetFromStorage('drccApplications', []);
    const updated = apps.map(a =>
      a.id === application.id
        ? { ...a, status: 'approved', processedDate: new Date().toISOString(), processedBy: 'Admin' }
        : a
    );
    safeSetToStorage('drccApplications', updated);
    setToast({ message: 'Application approved successfully!', type: 'success' });
    setTimeout(() => {
      onUpdate();
      onClose();
    }, 1500);
  };

  const rejectApplication = () => {
    if (!rejectionReason.trim()) {
      setToast({ message: 'Please provide a rejection reason', type: 'error' });
      return;
    }

    const apps = safeGetFromStorage('drccApplications', []);
    const updated = apps.map(a =>
      a.id === application.id
        ? {
            ...a,
            status: 'rejected',
            processedDate: new Date().toISOString(),
            processedBy: 'Admin',
            rejectionReason
          }
        : a
    );
    safeSetToStorage('drccApplications', updated);
    setToast({ message: 'Application rejected', type: 'error' });
    setTimeout(() => {
      onUpdate();
      onClose();
    }, 1500);
  };

  const markAsPaid = () => {
    const apps = safeGetFromStorage('drccApplications', []);
    const updated = apps.map(a =>
      a.id === application.id
        ? { ...a, status: 'paid' }
        : a
    );
    safeSetToStorage('drccApplications', updated);
    setToast({ message: 'Marked as paid successfully!', type: 'success' });
    setTimeout(() => {
      onUpdate();
      onClose();
    }, 1500);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="DRCC Application Details" size="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{student.fullName}</h3>
              <p className="text-gray-600">{student.uniRollNo} • {student.department}</p>
            </div>
            <Badge status={application.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Application Date</p>
              <p className="text-lg font-semibold text-blue-800">{formatDate(application.appliedDate)}</p>
            </div>
            {application.processedDate && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Processed Date</p>
                <p className="text-lg font-semibold text-green-800">{formatDate(application.processedDate)}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Financial Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Caution Deposit</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(application.cautionDeposit)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Deductions</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(application.deductions)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Refundable Amount</p>
                <p className="text-2xl font-bold text-blue-800">{formatCurrency(application.refundableAmount)}</p>
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
            <h4 className="font-semibold text-gray-800 mb-3">Documents</h4>
            <div className="space-y-2">
              {application.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{doc}</span>
                  <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm">
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {application.comments && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Comments</h4>
              <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{application.comments}</p>
            </div>
          )}

          {application.rejectionReason && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Rejection Reason</h4>
              <p className="text-red-700 p-3 bg-red-50 rounded-lg">{application.rejectionReason}</p>
            </div>
          )}

          {application.processedBy && (
            <div className="text-sm text-gray-600">
              Processed by: <span className="font-medium">{application.processedBy}</span>
            </div>
          )}

          <div className="border-t pt-4 flex space-x-3">
            {application.status === 'pending' && (
              <>
                <button
                  onClick={approveApplication}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  <CheckCircle size={20} />
                  <span>Approve Application</span>
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                >
                  <XCircle size={20} />
                  <span>Reject Application</span>
                </button>
              </>
            )}
            {application.status === 'approved' && (
              <button
                onClick={markAsPaid}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <DollarSign size={20} />
                <span>Mark as Paid</span>
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRejectDialog} onClose={() => setShowRejectDialog(false)} title="Reject Application" size="md">
        <div className="space-y-4">
          <p className="text-gray-700">Please provide a reason for rejecting this application:</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <div className="flex space-x-3">
            <button
              onClick={() => setShowRejectDialog(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={rejectApplication}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default DRCCApplicationModal;
