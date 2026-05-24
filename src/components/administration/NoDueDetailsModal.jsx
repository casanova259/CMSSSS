import { useState } from 'react';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { noDueAPI } from '../../api';

const CLEARANCES = [
  { key: 'library', label: 'Library', icon: '📚' },
  { key: 'hostel', label: 'Hostel', icon: '🏠' },
  { key: 'accounts', label: 'Accounts', icon: '💰' },
  { key: 'department', label: 'Department', icon: '🎓' },
  { key: 'examCell', label: 'Exam Cell', icon: '📝' },
];

const CLEARED_BY = {
  library: 'Librarian',
  hostel: 'Warden',
  accounts: 'Accountant',
  department: 'HOD',
  examCell: 'Controller',
};

const NoDueDetailsModal = ({ isOpen, onClose, application, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [loadingKey, setLoadingKey] = useState('');
  const [toast, setToast] = useState(null);

  if (!application) return null;

  const clearances = application.clearances || {};
  const clearedCount = Object.values(clearances).filter(c => c?.cleared).length;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const markClearance = async (key) => {
    setLoadingKey(key);
    try {
      await noDueAPI.updateClearance(application.id, key, {
        cleared: true,
        clearedBy: CLEARED_BY[key] || 'Admin',
        remarks: '',
      });
      showToast(`${CLEARANCES.find(c => c.key === key)?.label} clearance marked!`, 'success');
      onUpdate(); // refresh parent list
    } catch (err) {
      showToast(err.message || 'Failed to update clearance', 'error');
    } finally {
      setLoadingKey('');
    }
  };

  const generateCertificate = async () => {
    try {
      await noDueAPI.generateCertificate(application.id);
      showToast('No Due Certificate generated!', 'success');
      onUpdate();
    } catch (err) {
      showToast(err.message || 'Failed to generate certificate', 'error');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="No Due Certificate Details" size="lg">
        <div className="space-y-6">

          {/* Student Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{application.fullName}</h3>
              <p className="text-gray-600">{application.uniRollNo} • {application.department} • {application.year} Year</p>
              <p className="text-sm text-gray-500">{application.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Applied Date</p>
              <p className="font-semibold">{formatDate(application.appliedDate)}</p>
            </div>
          </div>

          {/* Clearances */}
          <div className="space-y-3">
            {CLEARANCES.map(({ key, label, icon }) => {
              const clearance = clearances[key] || { cleared: false, clearedBy: '', date: null, remarks: '' };
              const isExpanded = expandedSections[key];
              const isLoading = loadingKey === key;

              return (
                <div key={key} className="border rounded-lg overflow-hidden">
                  <div
                    onClick={() => toggleSection(key)}
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{label}</h4>
                        {clearance.cleared && clearance.clearedBy && (
                          <p className="text-xs text-gray-500">
                            Cleared by {clearance.clearedBy}{clearance.date ? ` on ${formatDate(clearance.date)}` : ''}
                          </p>
                        )}
                        {!clearance.cleared && clearance.remarks && (
                          <p className="text-xs text-red-500">{clearance.remarks}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {clearance.cleared
                        ? <CheckCircle className="text-green-500" size={24} />
                        : clearance.remarks
                          ? <XCircle className="text-red-500" size={24} />
                          : <Clock className="text-yellow-500" size={24} />}
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t bg-white">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="font-medium">
                              {clearance.cleared
                                ? <span className="text-green-600">✅ Cleared</span>
                                : clearance.remarks
                                  ? <span className="text-red-600">❌ Issues Found</span>
                                  : <span className="text-yellow-600">⏳ Pending</span>}
                            </p>
                          </div>
                          {clearance.clearedBy && (
                            <div>
                              <p className="text-xs text-gray-500">Cleared By</p>
                              <p className="font-medium">{clearance.clearedBy}</p>
                            </div>
                          )}
                        </div>

                        {clearance.remarks && (
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Issue Details</p>
                            <p className="text-sm text-red-700">{clearance.remarks}</p>
                          </div>
                        )}

                        {!clearance.cleared && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markClearance(key); }}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-lg transition-colors font-medium"
                          >
                            {isLoading
                              ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Clearing...</span></>
                              : <><CheckCircle size={16} /><span>Mark as Cleared</span></>}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-800">Overall Status</h4>
                <p className="text-sm text-gray-600">{clearedCount} of 5 clearances completed</p>
                <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(clearedCount / 5) * 100}%` }}></div>
                </div>
              </div>
              <div className="text-right">
                {application.status === 'complete'
                  ? <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium">All Cleared ✅</span>
                  : <span className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium">Pending ⏳</span>}
              </div>
            </div>
          </div>

          {/* Certificate */}
          {application.status === 'complete' && !application.certificateGenerated && (
            <button
              onClick={generateCertificate}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              🎓 Generate No Due Certificate
            </button>
          )}

          {application.certificateGenerated && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-semibold">✅ No Due Certificate Generated</p>
              <p className="text-green-600 text-sm mt-1">on {formatDate(application.certificateDate)}</p>
            </div>
          )}

        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default NoDueDetailsModal;