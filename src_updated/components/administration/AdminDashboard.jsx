import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, FileText, Users, Download, Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, isOverdue } from '../../utils/formatters';
import { studentsAPI, feesAPI, drccAPI, noDueAPI } from '../../api';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({ totalPaid: 0, totalUnpaid: 0, overdueFees: 0, pendingRefunds: 0, approvedRefunds: 0, rejectedRefunds: 0, totalStudents: 0, noDueCleared: 0 });
  const [loading, setLoading] = useState(true);
  const [allFees, setAllFees] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, fees, drccApps, noDueApps] = await Promise.all([
          studentsAPI.getAll(), feesAPI.getAll(), drccAPI.getAll(), noDueAPI.getAll(),
        ]);
        setAllFees(fees);
        const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0);
        const totalUnpaid = fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + Number(f.amount), 0);
        const overdueFees = fees.filter(f => f.status === 'unpaid' && isOverdue(f.dueDate)).reduce((sum, f) => sum + Number(f.amount), 0);
        setStats({ totalPaid, totalUnpaid, overdueFees, pendingRefunds: drccApps.filter(a => a.status === 'pending').length, approvedRefunds: drccApps.filter(a => a.status === 'approved').length, rejectedRefunds: drccApps.filter(a => a.status === 'rejected').length, totalStudents: students.length, noDueCleared: noDueApps.filter(a => a.status === 'complete').length });
      } catch (err) { console.error('Failed to load dashboard stats:', err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const feeData = [
    { name: 'Jan', paid: 250000, unpaid: 75000 }, { name: 'Feb', paid: 280000, unpaid: 65000 },
    { name: 'Mar', paid: 320000, unpaid: 55000 }, { name: 'Apr', paid: 290000, unpaid: 70000 },
    { name: 'May', paid: 350000, unpaid: 45000 }, { name: 'Jun', paid: stats.totalPaid, unpaid: stats.totalUnpaid }
  ];

  const generateDefaulterReport = () => {
    const defaulters = allFees.filter(f => f.status === 'unpaid').map(f => ({ name: f.fullName || 'Unknown', rollNo: f.uniRollNo || 'N/A', department: f.department || 'N/A', amount: f.amount, dueDate: f.dueDate }));
    const headers = ['Name', 'Roll No', 'Department', 'Amount', 'Due Date'];
    const rows = defaulters.map(d => [d.name, d.rollNo, d.department, formatCurrency(d.amount), d.dueDate]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fee-defaulters.csv'; a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-4xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 mt-1">Welcome back to College Admin Portal</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(stats.totalPaid), color: 'green', icon: <DollarSign className="text-green-600" size={24} />, trend: <><TrendingUp size={16} className="mr-1" /><span>+12.5% from last month</span></>, trendColor: 'green' },
          { label: 'Unpaid Fees', value: formatCurrency(stats.totalUnpaid), color: 'red', icon: <AlertCircle className="text-red-600" size={24} />, trend: <><TrendingDown size={16} className="mr-1" /><span>-3.2% from last month</span></>, trendColor: 'red' },
          { label: 'Overdue', value: formatCurrency(stats.overdueFees), color: 'orange', icon: <AlertCircle className="text-orange-600" size={24} />, trend: <span>Action Required</span>, trendColor: 'orange' },
          { label: 'Total Students', value: stats.totalStudents, color: 'blue', icon: <Users className="text-blue-600" size={24} />, trend: <span>Active Students</span>, trendColor: 'blue' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-${card.color}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <div className={`flex items-center mt-2 text-${card.trendColor}-600 text-sm`}>{card.trend}</div>
              </div>
              <div className={`p-3 bg-${card.color}-100 rounded-lg`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Fee Collection Trend</h2>
            <button onClick={generateDefaulterReport} className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"><Download size={16} /><span>Export</span></button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" stroke="#9ca3af" /><YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} /><Legend />
                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="unpaid" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Pending Refunds', value: stats.pendingRefunds, color: 'blue', nav: 'refunds' },
              { label: 'Approved Refunds', value: stats.approvedRefunds, color: 'green', nav: 'refunds' },
              { label: 'No Due Cleared', value: stats.noDueCleared, color: 'red', nav: 'nodue' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center justify-between p-3 bg-${s.color}-50 rounded-lg`}>
                <div><p className="text-sm text-gray-600">{s.label}</p><p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p></div>
                <button onClick={() => onNavigate(s.nav)} className={`text-${s.color}-600 hover:text-${s.color}-700 font-semibold text-sm`}>View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { key: 'students', icon: <Users className="text-blue-600 mb-3" size={28} />, label: 'All Students', sub: 'Manage records' },
            { key: 'drcc', icon: <FileText className="text-blue-600 mb-3" size={28} />, label: 'DRCC Students', sub: 'Refund applications' },
            { key: 'refunds', icon: <FileText className="text-blue-600 mb-3" size={28} />, label: 'Refunds', sub: 'Process applications' },
            { key: 'receipt', icon: <Receipt className="text-blue-600 mb-3" size={28} />, label: 'Generate Receipt', sub: 'Create receipts' },
            { key: 'nodue', icon: <FileText className="text-blue-600 mb-3" size={28} />, label: 'No Due', sub: 'Clearances' },
          ].map(item => (
            <button key={item.key} onClick={() => onNavigate(item.key)} className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              {item.icon}<span className="font-semibold text-gray-900 text-sm">{item.label}</span><span className="text-gray-500 text-xs mt-1">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
