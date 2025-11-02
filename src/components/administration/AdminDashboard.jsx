import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, FileText, Users, Download, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../common/StatCard';
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
    {
      name: 'Fee Collection',
      Paid: stats.totalPaid,
      Unpaid: stats.totalUnpaid,
      Overdue: stats.overdueFees
    }
  ];

  const noDueData = [
    { name: 'Cleared', value: stats.noDueCleared },
    { name: 'Pending', value: stats.totalStudents - stats.noDueCleared }
  ];

  const COLORS = ['#10b981', '#f59e0b'];

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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Administration Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of fees, refunds, and clearances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Fees Collected"
          value={formatCurrency(stats.totalPaid)}
          icon={DollarSign}
          color="bg-green-500"
          change="12.5"
          trend="up"
        />
        <StatCard
          title="Unpaid Fees"
          value={formatCurrency(stats.totalUnpaid)}
          icon={AlertCircle}
          color="bg-red-500"
          change="3.2"
          trend="down"
        />
        <StatCard
          title="Overdue Fees"
          value={formatCurrency(stats.overdueFees)}
          icon={AlertCircle}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Fee Management</h2>
            <button
              onClick={generateDefaulterReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              <Download size={16} />
              <span>Download Report</span>
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Paid" fill="#10b981" />
                <Bar dataKey="Unpaid" fill="#ef4444" />
                <Bar dataKey="Overdue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Due Status</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={noDueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {noDueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate('nodue')}
              className="text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center mx-auto"
            >
              View Details <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Refund Applications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRefunds}</p>
              </div>
              <FileText className="text-yellow-500" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedRefunds}</p>
              </div>
              <FileText className="text-green-500" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedRefunds}</p>
              </div>
              <FileText className="text-red-500" size={32} />
            </div>
          </div>
          <button
            onClick={() => onNavigate('refunds')}
            className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Process Applications
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('students')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <Users className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">All Students</h3>
              <p className="text-sm text-gray-600">View and manage student records</p>
            </button>
            <button
              onClick={() => onNavigate('drcc')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <FileText className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">DRCC Students</h3>
              <p className="text-sm text-gray-600">Manage caution deposit refunds</p>
            </button>
            <button
              onClick={() => onNavigate('receipt')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <FileText className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">Generate Receipt</h3>
              <p className="text-sm text-gray-600">Create fee payment receipts</p>
            </button>
            <button
              onClick={() => onNavigate('nodue')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <FileText className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">No Due Clearances</h3>
              <p className="text-sm text-gray-600">Track clearance status</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
