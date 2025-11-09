import { useState } from 'react';
import { jsPDF } from 'jspdf';
import Toast from '../common/Toast';
import { generateReceiptNo } from '../../utils/formatters';
import { validateRollNo, validateAmount } from '../../utils/validators';
import { safeGetFromStorage, safeSetToStorage, getStudentByRollNo } from '../../utils/storage';
import { FileText, Download, Mail, Printer, RotateCcw } from 'lucide-react';

const FeeReceiptGenerator = () => {
  const [receiptData, setReceiptData] = useState({
    fullName: '',
    uniRollNo: '',
    department: '',
    semester: '',
    academicYear: '2024-25',
    feeType: 'Tuition',
    amount: '',
    paymentMode: 'Cash',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [receiptNo, setReceiptNo] = useState(generateReceiptNo());
  const [toast, setToast] = useState(null);

  const handleChange = (field, value) => {
    setReceiptData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'uniRollNo' && value.length >= 10) {
      const student = getStudentByRollNo(value);
      if (student) {
        setReceiptData(prev => ({
          ...prev,
          fullName: student.fullName,
          department: student.department,
          semester: student.semester.toString()
        }));
        setToast({ message: 'Student details auto-filled', type: 'success' });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!receiptData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!receiptData.uniRollNo.trim()) newErrors.uniRollNo = 'Roll number is required';
    if (!validateRollNo(receiptData.uniRollNo)) newErrors.uniRollNo = 'Invalid roll number format (e.g., UNI2021001)';
    if (!receiptData.department) newErrors.department = 'Department is required';
    if (!receiptData.semester) newErrors.semester = 'Semester is required';
    if (!receiptData.amount || !validateAmount(receiptData.amount)) newErrors.amount = 'Valid amount is required';
    if (['Online', 'Cheque', 'DD'].includes(receiptData.paymentMode) && !receiptData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required for this payment mode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePDF = () => {
    if (!validateForm()) {
      setToast({ message: 'Please fix all errors before generating', type: 'error' });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text('MIMIT MALOUT', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('MIMIT MALOUT Address, City, State - PIN', 105, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(18);
    doc.text('FEE RECEIPT', 105, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Receipt No: ${receiptNo}`, 20, 55);
    doc.text(`Date: ${receiptData.paymentDate}`, 150, 55);

    doc.setLineWidth(0.3);
    doc.rect(20, 65, 170, 60);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Student Details:', 25, 73);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${receiptData.fullName}`, 25, 82);
    doc.text(`University Roll No: ${receiptData.uniRollNo}`, 25, 90);
    doc.text(`Department: ${receiptData.department}`, 25, 98);
    doc.text(`Semester: ${receiptData.semester}`, 25, 106);
    doc.text(`Academic Year: ${receiptData.academicYear}`, 25, 114);

    doc.rect(20, 135, 170, 45);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Fee Details:', 25, 143);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Fee Type: ${receiptData.feeType}`, 25, 152);
    doc.text(`Amount Paid: Rs. ${parseFloat(receiptData.amount).toLocaleString('en-IN')}`, 25, 160);
    doc.text(`Payment Mode: ${receiptData.paymentMode}`, 25, 168);
    if (receiptData.transactionId) {
      doc.text(`Transaction ID: ${receiptData.transactionId}`, 25, 176);
    }

    if (receiptData.remarks) {
      doc.setFontSize(10);
      doc.text(`Remarks: ${receiptData.remarks}`, 20, 195);
    }

    doc.setFontSize(10);
    doc.text('Authorized Signature', 150, 260);
    doc.line(145, 258, 185, 258);

    doc.setFontSize(8);
    doc.text('This is a computer generated receipt', 105, 280, { align: 'center' });

    doc.save(`receipt-${receiptNo}.pdf`);

    saveFeeRecord();
    setToast({ message: 'Receipt generated successfully!', type: 'success' });
  };

  const saveFeeRecord = () => {
    const student = getStudentByRollNo(receiptData.uniRollNo);
    if (!student) return;

    const fees = safeGetFromStorage('fees', []);
    const newFee = {
      id: fees.length + 1,
      studentId: student.id,
      feeType: receiptData.feeType,
      amount: parseFloat(receiptData.amount),
      semester: receiptData.semester,
      academicYear: receiptData.academicYear,
      status: 'paid',
      dueDate: receiptData.paymentDate,
      paidDate: receiptData.paymentDate,
      paymentMode: receiptData.paymentMode,
      transactionId: receiptData.transactionId || null,
      receiptNo: receiptNo,
      remarks: receiptData.remarks
    };

    fees.push(newFee);
    safeSetToStorage('fees', fees);
  };

  const clearForm = () => {
    setReceiptData({
      fullName: '',
      uniRollNo: '',
      department: '',
      semester: '',
      academicYear: '2024-25',
      feeType: 'Tuition',
      amount: '',
      paymentMode: 'Cash',
      transactionId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setErrors({});
    setReceiptNo(generateReceiptNo());
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fee Receipt Generator</h1>
        <p className="text-gray-600 mt-1">Generate and print fee payment receipts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Receipt Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={receiptData.uniRollNo}
                onChange={(e) => handleChange('uniRollNo', e.target.value)}
                placeholder="UNI2021001"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.uniRollNo ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.uniRollNo && <p className="text-red-500 text-xs mt-1">{errors.uniRollNo}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={receiptData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={receiptData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={receiptData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  min="1"
                  max="8"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.semester ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
              <input
                type="text"
                value={receiptData.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                value={receiptData.feeType}
                onChange={(e) => handleChange('feeType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tuition">Tuition Fee</option>
                <option value="Hostel">Hostel Fee</option>
                <option value="Exam">Exam Fee</option>
                <option value="Library">Library Fee</option>
                <option value="Development">Development Fee</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={receiptData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
              <select
                value={receiptData.paymentMode}
                onChange={(e) => handleChange('paymentMode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Cheque">Cheque</option>
                <option value="DD">DD</option>
              </select>
            </div>

            {['Online', 'Cheque', 'DD'].includes(receiptData.paymentMode) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={receiptData.transactionId}
                  onChange={(e) => handleChange('transactionId', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.transactionId ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
              <input
                type="date"
                value={receiptData.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
              <textarea
                value={receiptData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={generatePDF}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <Download size={20} />
                <span>Generate PDF</span>
              </button>
              <button
                onClick={clearForm}
                className="px-4 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Receipt Preview</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
            <div className="bg-white p-8 shadow-lg">
              <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">MIMIT MALOUT</h1>
                <p className="text-sm text-gray-600">MIMIT MALOUT Address, City, State - PIN</p>
              </div>

              <h2 className="text-xl font-bold text-center text-gray-800 mb-6">FEE RECEIPT</h2>

              <div className="flex justify-between mb-6 text-sm">
                <div>
                  <span className="font-semibold">Receipt No:</span> {receiptNo}
                </div>
                <div>
                  <span className="font-semibold">Date:</span> {receiptData.paymentDate}
                </div>
              </div>

              <div className="border border-gray-300 p-4 mb-4">
                <h3 className="font-bold text-gray-800 mb-3">Student Details:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {receiptData.fullName || '_____________'}</p>
                  <p><span className="font-semibold">Roll No:</span> {receiptData.uniRollNo || '_____________'}</p>
                  <p><span className="font-semibold">Department:</span> {receiptData.department || '_____________'}</p>
                  <p><span className="font-semibold">Semester:</span> {receiptData.semester || '_____________'}</p>
                  <p><span className="font-semibold">Academic Year:</span> {receiptData.academicYear}</p>
                </div>
              </div>

              <div className="border border-gray-300 p-4 mb-4">
                <h3 className="font-bold text-gray-800 mb-3">Fee Details:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Fee Type:</span> {receiptData.feeType}</p>
                  <p><span className="font-semibold">Amount:</span> Rs. {receiptData.amount ? parseFloat(receiptData.amount).toLocaleString('en-IN') : '0'}</p>
                  <p><span className="font-semibold">Payment Mode:</span> {receiptData.paymentMode}</p>
                  {receiptData.transactionId && (
                    <p><span className="font-semibold">Transaction ID:</span> {receiptData.transactionId}</p>
                  )}
                </div>
              </div>

              {receiptData.remarks && (
                <div className="mb-6 text-sm">
                  <span className="font-semibold">Remarks:</span> {receiptData.remarks}
                </div>
              )}

              <div className="mt-12 text-right">
                <div className="inline-block">
                  <p className="text-sm font-semibold mb-1">Authorized Signature</p>
                  <div className="border-t border-gray-800 w-40"></div>
                </div>
              </div>

              <p className="text-xs text-center text-gray-500 mt-8">This is a computer generated receipt</p>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FeeReceiptGenerator;
