import { useState } from 'react';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { safeGetFromStorage, safeSetToStorage, getStudentById } from '../../utils/storage';

const NoDueDetailsModal = ({ isOpen, onClose, application, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [toast, setToast] = useState(null);

  if (!application) return null;

  const student = getStudentById(application.studentId);
  if (!student) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const markClearance = (department) => {
    const apps = safeGetFromStorage('noDueApplications', []);
    const updated = apps.map(app => {
      if (app.id === application.id) {
        app.clearances[department] = {
          cleared: true,
          clearedBy: 'Admin',
          date: new Date().toISOString(),
          remarks: ''
        };

        const allCleared = Object.values(app.clearances).every(c => c.cleared);
        if (allCleared) app.status = 'complete';
      }
      return app;
    });
    safeSetToStorage('noDueApplications', updated);
    setToast({ message: `${department} clearance marked!`, type: 'success' });
    setTimeout(() => {
      onUpdate();
    }, 1500);
  };

  const clearances = [
    { key: 'library', label: 'Library', icon: '📚' },
    { key: 'hostel', label: 'Hostel', icon: '🏠' },
    { key: 'accounts', label: 'Accounts', icon: '💰' },
    { key: 'department', label: 'Department', icon: '🎓' },
    { key: 'examCell', label: 'Exam Cell', icon: '📝' }
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="No Due Certificate Details" size="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{student.fullName}</h3>
              <p className="text-gray-600">{student.uniRollNo} • {student.department} • {student.year} Year</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Applied Date</p>
              <p className="font-semibold">{formatDate(application.appliedDate)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {clearances.map(({ key, label, icon }) => {
              const clearance = application.clearances[key];
              const isExpanded = expandedSections[key];

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
                          <p className="text-xs text-gray-600">
                            Cleared by {clearance.clearedBy} on {formatDate(clearance.date)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {clearance.cleared ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : clearance.remarks ? (
                        <XCircle className="text-red-500" size={24} />
                      ) : (
                        <Clock className="text-yellow-500" size={24} />
                      )}
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
                              {clearance.cleared ? (
                                <span className="text-green-600">Cleared</span>
                              ) : clearance.remarks ? (
                                <span className="text-red-600">Issues Found</span>
                              ) : (
                                <span className="text-yellow-600">Pending</span>
                              )}
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
                            onClick={() => markClearance(key)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle size={16} />
                            <span>Mark as Cleared</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-800">Overall Status</h4>
                <p className="text-sm text-gray-600">
                  {Object.values(application.clearances).filter(c => c.cleared).length} of 5 clearances completed
                </p>
              </div>
              <div className="text-right">
                {application.status === 'complete' ? (
                  <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium">
                    All Cleared
                  </span>
                ) : application.status === 'issues' ? (
                  <span className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium">
                    Has Issues
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {application.certificateGenerated && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                No Due Certificate generated on {formatDate(application.certificateDate)}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default NoDueDetailsModal;
