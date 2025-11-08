import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, FileText, Users, Download, Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, isOverdue } from '../../utils/formatters';
import { safeGetFromStorage } from '../../utils/storage';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    overdueFees: 0,
    pendingRefunds: 0,
    approvedRefunds: 0,
    rejectedRefunds: 0,
    totalStudents: 0,
    noDueCleared: 0
  });

  useEffect(() => {
    const students = safeGetFromStorage('students', []);
    const fees = safeGetFromStorage('fees', []);
    const drccApplications = safeGetFromStorage('drccApplications', []);
    const noDueApplications = safeGetFromStorage('noDueApplications', []);

    const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const totalUnpaid = fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
    const overdueFees = fees.filter(f => f.status === 'unpaid' && isOverdue(f.dueDate)).reduce((sum, f) => sum + f.amount, 0);
    const pendingRefunds = drccApplications.filter(a => a.status === 'pending').length;
    const approvedRefunds = drccApplications.filter(a => a.status === 'approved').length;
    const rejectedRefunds = drccApplications.filter(a => a.status === 'rejected').length;
    const noDueCleared = noDueApplications.filter(a => a.status === 'complete').length;

    setStats({
      totalPaid,
      totalUnpaid,
      overdueFees,
      pendingRefunds,
      approvedRefunds,
      rejectedRefunds,
      totalStudents: students.length,
      noDueCleared
    });
  }, []);

  const feeData = [
    { name: 'Jan', paid: 250000, unpaid: 75000 },
    { name: 'Feb', paid: 280000, unpaid: 65000 },
    { name: 'Mar', paid: 320000, unpaid: 55000 },
    { name: 'Apr', paid: 290000, unpaid: 70000 },
    { name: 'May', paid: 350000, unpaid: 45000 },
    { name: 'Jun', paid: stats.totalPaid, unpaid: stats.totalUnpaid }
  ];

  const generateDefaulterReport = () => {
    const fees = safeGetFromStorage('fees', []);
    const students = safeGetFromStorage('students', []);

    const defaulters = fees
      .filter(f => f.status === 'unpaid')
      .map(f => {
        const student = students.find(s => s.id === f.studentId);
        return {
          name: student?.fullName || 'Unknown',
          rollNo: student?.uniRollNo || 'N/A',
          department: student?.department || 'N/A',
          amount: f.amount,
          dueDate: f.dueDate
        };
      });

    const headers = ['Name', 'Roll No', 'Department', 'Amount', 'Due Date'];
    const rows = defaulters.map(d => [d.name, d.rollNo, d.department, formatCurrency(d.amount), d.dueDate]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fee-defaulters.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back to MIMIT MALOUT Admin Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Collected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalPaid)}</p>
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>+12.5% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Unpaid Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalUnpaid)}</p>
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <TrendingDown size={16} className="mr-1" />
                <span>-3.2% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.overdueFees)}</p>
              <div className="flex items-center mt-2 text-orange-600 text-sm">
                <span>Action Required</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
              <div className="flex items-center mt-2 text-blue-600 text-sm">
                <span>Active Students</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Fee Collection Trend</h2>
            <button
              onClick={generateDefaulterReport}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="unpaid" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending Refunds</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingRefunds}</p>
              </div>
              <button
                onClick={() => onNavigate('refunds')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Approved Refunds</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedRefunds}</p>
              </div>
              <button
                onClick={() => onNavigate('refunds')}
                className="text-green-600 hover:text-green-700 font-semibold text-sm"
              >
                View
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">No Due Cleared</p>
                <p className="text-2xl font-bold text-red-600">{stats.noDueCleared}</p>
              </div>
              <button
                onClick={() => onNavigate('nodue')}
                className="text-red-600 hover:text-red-700 font-semibold text-sm"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => onNavigate('students')}
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <Users className="text-blue-600 mb-3" size={28} />
            <span className="font-semibold text-gray-900 text-sm">All Students</span>
            <span className="text-gray-500 text-xs mt-1">Manage records</span>
          </button>
          <button
            onClick={() => onNavigate('drcc')}
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <FileText className="text-blue-600 mb-3" size={28} />
            <span className="font-semibold text-gray-900 text-sm">DRCC Students</span>
            <span className="text-gray-500 text-xs mt-1">Refund applications</span>
          </button>
          <button
            onClick={() => onNavigate('refunds')}
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <FileText className="text-blue-600 mb-3" size={28} />
            <span className="font-semibold text-gray-900 text-sm">Refunds</span>
            <span className="text-gray-500 text-xs mt-1">Process applications</span>
          </button>
          <button
            onClick={() => onNavigate('receipt')}
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <Receipt className="text-blue-600 mb-3" size={28} />
            <span className="font-semibold text-gray-900 text-sm">Generate Receipt</span>
            <span className="text-gray-500 text-xs mt-1">Create receipts</span>
          </button>
          <button
            onClick={() => onNavigate('nodue')}
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <FileText className="text-blue-600 mb-3" size={28} />
            <span className="font-semibold text-gray-900 text-sm">No Due</span>
            <span className="text-gray-500 text-xs mt-1">Clearances</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
