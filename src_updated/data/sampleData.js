export const initializeSampleData = () => {
  if (!localStorage.getItem('students')) {
    const sampleStudents = [
      { id: 1, fullName: 'Rahul Sharma', rollNo: 'CSE001', uniRollNo: 'UNI2021001', department: 'CSE', year: '4th', semester: 8, email: 'rahul@college.edu', phone: '9876543210', hostelRoom: 'A-201', isDRCC: true, photo: '👨‍🎓', bankAccount: '1234567890', ifscCode: 'SBIN0001234', bankName: 'SBI' },
      { id: 2, fullName: 'Priya Singh', rollNo: 'ECE002', uniRollNo: 'UNI2021002', department: 'ECE', year: '3rd', semester: 6, email: 'priya@college.edu', phone: '9876543211', hostelRoom: 'B-105', isDRCC: false, photo: '👩‍🎓', bankAccount: '0987654321', ifscCode: 'HDFC0001234', bankName: 'HDFC' },
      { id: 3, fullName: 'Amit Kumar', rollNo: 'ME003', uniRollNo: 'UNI2022003', department: 'ME', year: '2nd', semester: 4, email: 'amit@college.edu', phone: '9876543212', hostelRoom: null, isDRCC: false, photo: '👨‍🎓', bankAccount: '1122334455', ifscCode: 'ICIC0001234', bankName: 'ICICI' },
      { id: 4, fullName: 'Sneha Patel', rollNo: 'CSE004', uniRollNo: 'UNI2020004', department: 'CSE', year: '4th', semester: 8, email: 'sneha@college.edu', phone: '9876543213', hostelRoom: 'B-202', isDRCC: true, photo: '👩‍🎓', bankAccount: '5566778899', ifscCode: 'SBIN0005678', bankName: 'SBI' },
      { id: 5, fullName: 'Vikram Reddy', rollNo: 'ECE005', uniRollNo: 'UNI2021005', department: 'ECE', year: '3rd', semester: 6, email: 'vikram@college.edu', phone: '9876543214', hostelRoom: 'A-150', isDRCC: false, photo: '👨‍🎓', bankAccount: '6677889900', ifscCode: 'HDFC0005678', bankName: 'HDFC' },
      { id: 6, fullName: 'Ananya Desai', rollNo: 'CE006', uniRollNo: 'UNI2021006', department: 'CE', year: '2nd', semester: 4, email: 'ananya@college.edu', phone: '9876543215', hostelRoom: 'C-101', isDRCC: false, photo: '👩‍🎓', bankAccount: '7788990011', ifscCode: 'SBIN0009012', bankName: 'SBI' },
      { id: 7, fullName: 'Rohan Gupta', rollNo: 'CSE007', uniRollNo: 'UNI2020007', department: 'CSE', year: '4th', semester: 8, email: 'rohan@college.edu', phone: '9876543216', hostelRoom: 'A-301', isDRCC: true, photo: '👨‍🎓', bankAccount: '8899001122', ifscCode: 'HDFC0009012', bankName: 'HDFC' },
      { id: 8, fullName: 'Kavya Iyer', rollNo: 'ECE008', uniRollNo: 'UNI2022008', department: 'ECE', year: '1st', semester: 2, email: 'kavya@college.edu', phone: '9876543217', hostelRoom: null, isDRCC: false, photo: '👩‍🎓', bankAccount: '9900112233', ifscCode: 'ICIC0009012', bankName: 'ICICI' }
    ];

    const sampleFees = [
      { id: 1, studentId: 1, feeType: 'Tuition', amount: 75000, semester: '8th', academicYear: '2024-25', status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-10', paymentMode: 'Online', transactionId: 'TXN123456', receiptNo: 'REC001', remarks: '' },
      { id: 2, studentId: 2, feeType: 'Tuition', amount: 75000, semester: '6th', academicYear: '2024-25', status: 'unpaid', dueDate: '2024-08-15', paidDate: null, paymentMode: null, transactionId: null, receiptNo: null, remarks: '' },
      { id: 3, studentId: 3, feeType: 'Hostel', amount: 25000, semester: '4th', academicYear: '2024-25', status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-12', paymentMode: 'Cash', transactionId: null, receiptNo: 'REC002', remarks: '' },
      { id: 4, studentId: 4, feeType: 'Tuition', amount: 75000, semester: '8th', academicYear: '2024-25', status: 'unpaid', dueDate: '2024-07-30', paidDate: null, paymentMode: null, transactionId: null, receiptNo: null, remarks: 'Overdue' },
      { id: 5, studentId: 5, feeType: 'Exam', amount: 5000, semester: '6th', academicYear: '2024-25', status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-14', paymentMode: 'Online', transactionId: 'TXN789012', receiptNo: 'REC003', remarks: '' },
      { id: 6, studentId: 1, feeType: 'Hostel', amount: 30000, semester: '8th', academicYear: '2024-25', status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-11', paymentMode: 'Online', transactionId: 'TXN234567', receiptNo: 'REC004', remarks: '' },
      { id: 7, studentId: 6, feeType: 'Tuition', amount: 75000, semester: '4th', academicYear: '2024-25', status: 'unpaid', dueDate: '2024-09-01', paidDate: null, paymentMode: null, transactionId: null, receiptNo: null, remarks: '' },
      { id: 8, studentId: 7, feeType: 'Tuition', amount: 75000, semester: '8th', academicYear: '2024-25', status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-09', paymentMode: 'Cheque', transactionId: 'CHQ345678', receiptNo: 'REC005', remarks: '' },
      { id: 9, studentId: 8, feeType: 'Tuition', amount: 75000, semester: '2nd', academicYear: '2024-25', status: 'paid', dueDate: '2024-08-15', paidDate: '2024-08-13', paymentMode: 'Online', transactionId: 'TXN456789', receiptNo: 'REC006', remarks: '' }
    ];

    const sampleDRCC = [
      { id: 1, studentId: 1, cautionDeposit: 5000, deductions: 0, refundableAmount: 5000, appliedDate: '2024-10-01', status: 'pending', processedDate: null, processedBy: null, rejectionReason: null, documents: ['degree.pdf', 'id.pdf'], comments: '' },
      { id: 2, studentId: 4, cautionDeposit: 5000, deductions: 200, refundableAmount: 4800, appliedDate: '2024-09-25', status: 'approved', processedDate: '2024-10-15', processedBy: 'Admin', rejectionReason: null, documents: ['degree.pdf', 'id.pdf'], comments: 'Library fine deducted' },
      { id: 3, studentId: 7, cautionDeposit: 5000, deductions: 0, refundableAmount: 5000, appliedDate: '2024-10-10', status: 'pending', processedDate: null, processedBy: null, rejectionReason: null, documents: ['degree.pdf', 'id.pdf', 'nodue.pdf'], comments: '' }
    ];

    const sampleNoDue = [
      {
        id: 1,
        studentId: 1,
        appliedDate: '2024-10-01',
        status: 'pending',
        clearances: {
          library: { cleared: true, clearedBy: 'Librarian', date: '2024-10-05', remarks: '' },
          hostel: { cleared: true, clearedBy: 'Warden', date: '2024-10-06', remarks: '' },
          accounts: { cleared: false, clearedBy: '', date: '', remarks: 'Pending payment verification' },
          department: { cleared: true, clearedBy: 'HOD CSE', date: '2024-10-07', remarks: '' },
          examCell: { cleared: false, clearedBy: '', date: '', remarks: '' }
        },
        certificateGenerated: false,
        certificateDate: null
      },
      {
        id: 2,
        studentId: 4,
        appliedDate: '2024-09-20',
        status: 'complete',
        clearances: {
          library: { cleared: true, clearedBy: 'Librarian', date: '2024-09-22', remarks: '' },
          hostel: { cleared: true, clearedBy: 'Warden', date: '2024-09-23', remarks: '' },
          accounts: { cleared: true, clearedBy: 'Accountant', date: '2024-09-24', remarks: '' },
          department: { cleared: true, clearedBy: 'HOD CSE', date: '2024-09-25', remarks: '' },
          examCell: { cleared: true, clearedBy: 'Controller', date: '2024-09-26', remarks: '' }
        },
        certificateGenerated: true,
        certificateDate: '2024-09-27'
      },
      {
        id: 3,
        studentId: 7,
        appliedDate: '2024-10-10',
        status: 'pending',
        clearances: {
          library: { cleared: true, clearedBy: 'Librarian', date: '2024-10-12', remarks: '' },
          hostel: { cleared: false, clearedBy: '', date: '', remarks: 'Pending room inspection' },
          accounts: { cleared: true, clearedBy: 'Accountant', date: '2024-10-13', remarks: '' },
          department: { cleared: false, clearedBy: '', date: '', remarks: '' },
          examCell: { cleared: true, clearedBy: 'Controller', date: '2024-10-14', remarks: '' }
        },
        certificateGenerated: false,
        certificateDate: null
      }
    ];

    localStorage.setItem('students', JSON.stringify(sampleStudents));
    localStorage.setItem('fees', JSON.stringify(sampleFees));
    localStorage.setItem('drccApplications', JSON.stringify(sampleDRCC));
    localStorage.setItem('noDueApplications', JSON.stringify(sampleNoDue));
  }
};
