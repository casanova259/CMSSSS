import { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Toast from '../common/Toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { drccAPI, studentsAPI } from '../../api';
import { Download, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const DRCCApplicationModal = ({ isOpen, onClose, application, onUpdate }) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState('');
  const [toast, setToast] = useState(null);

  if (!application) return null;

  // application already has fullName, department etc joined from the API
  // documents may be null from DB — default to empty array
  const documents = application.documents || [];

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const approveApplication = async () => {
    setLoading('approve');
    try {
      await drccAPI.approve(application.id, 'Admin', application.comments || '');
      showToast('Application approved successfully!', 'success');
      setTimeout(() => { onUpdate(); onClose(); }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to approve', 'error');
    } finally {
      setLoading('');
    }
  };

  const rejectApplication = async () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    setLoading('reject');
    try {
      await drccAPI.reject(application.id, 'Admin', rejectionReason);
      showToast('Application rejected', 'error');
      setTimeout(() => { onUpdate(); onClose(); setShowRejectDialog(false); }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to reject', 'error');
    } finally {
      setLoading('');
    }
  };

  const markAsPaid = async () => {
    setLoading('paid');
    try {
      await drccAPI.update(application.id, { status: 'paid' });
      showToast('Marked as paid successfully!', 'success');
      setTimeout(() => { onUpdate(); onClose(); }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setLoading('');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="DRCC Application Details" size="lg">
        <div className="space-y-6">

          {/* Student Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{application.fullName}</h3>
              <p className="text-gray-600">{application.uniRollNo} • {application.department} • {application.year} Year</p>
              <p className="text-sm text-gray-500">{application.email}</p>
            </div>
            <Badge status={application.status} />
          </div>

          {/* Dates */}
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

          {/* Financial */}
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

          {/* Bank Details — from joined student data */}
          {(application.bankName || application.bankAccount) && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="text-sm font-medium">{application.bankName || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-sm font-medium">{application.bankAccount || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">IFSC Code</p>
                  <p className="text-sm font-medium">{application.ifscCode || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents — safely handle null */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Documents</h4>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{doc}</span>
                    <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm">
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 p-3 bg-gray-50 rounded-lg">No documents uploaded</p>
            )}
          </div>

          {/* Comments */}
          {application.comments && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Comments</h4>
              <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{application.comments}</p>
            </div>
          )}

          {/* Rejection Reason */}
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

          {/* Action Buttons */}
          <div className="border-t pt-4 flex space-x-3">
            {application.status === 'pending' && (
              <>
                <button
                  onClick={approveApplication}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-lg transition-colors font-medium"
                >
                  {loading === 'approve'
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Approving...</span></>
                    : <><CheckCircle size={20} /><span>Approve Application</span></>}
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={!!loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-lg transition-colors font-medium"
                >
                  <XCircle size={20} />
                  <span>Reject Application</span>
                </button>
              </>
            )}
            {application.status === 'approved' && (
              <button
                onClick={markAsPaid}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg transition-colors font-medium"
              >
                {loading === 'paid'
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Updating...</span></>
                  : <><DollarSign size={20} /><span>Mark as Paid</span></>}
              </button>
            )}
          </div>

        </div>
      </Modal>

      {/* Reject Dialog */}
      <Modal isOpen={showRejectDialog} onClose={() => setShowRejectDialog(false)} title="Reject Application" size="md">
        <div className="space-y-4">
          <p className="text-gray-700">Please provide a reason for rejecting this application:</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
          <div className="flex space-x-3">
            <button onClick={() => setShowRejectDialog(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button onClick={rejectApplication} disabled={loading === 'reject'}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-lg font-medium flex items-center justify-center space-x-2">
              {loading === 'reject'
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Rejecting...</span></>
                : <span>Confirm Rejection</span>}
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default DRCCApplicationModal;