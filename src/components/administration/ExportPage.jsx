import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Users, CheckCircle, XCircle, BarChart2, Loader } from 'lucide-react';
import { studentsAPI, feesAPI } from '../../api';
import { exportStudentsToExcel } from '../../utils/excelExport';

const ExportPage = () => {
    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [s, f] = await Promise.all([studentsAPI.getAll(), feesAPI.getAll()]);
                setStudents(s);
                setFees(f);
            } catch (err) { console.error('Failed to load data:', err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleExport = async (type) => {
        setExporting(type);
        await new Promise(r => setTimeout(r, 300)); // small delay for UX
        exportStudentsToExcel(students, fees, type);
        setExporting('');
    };

    // Stats
    const totalStudents = students.length;
    const paidStudentIds = [...new Set(fees.filter(f => f.status === 'paid').map(f => f.studentId))];
    const unpaidStudentIds = [...new Set(fees.filter(f => f.status === 'unpaid').map(f => f.studentId))];
    const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0);
    const totalPending = fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + Number(f.amount), 0);
    const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

    const reports = [
        {
            type: 'full',
            icon: <BarChart2 className="text-purple-600" size={32} />,
            color: 'purple',
            title: 'Full Fee Report',
            description: 'Complete report with Summary, All Students, Paid & Unpaid sheets all in one Excel file.',
            badge: '4 Sheets',
            badgeColor: 'bg-purple-100 text-purple-700',
            stat: `${totalStudents} students`,
            btnColor: 'bg-purple-600 hover:bg-purple-700',
        },
        {
            type: 'students',
            icon: <Users className="text-blue-600" size={32} />,
            color: 'blue',
            title: 'All Students',
            description: 'List of all students with their personal, academic, bank details and overall fee status.',
            badge: `${totalStudents} records`,
            badgeColor: 'bg-blue-100 text-blue-700',
            stat: `${totalStudents} total students`,
            btnColor: 'bg-blue-600 hover:bg-blue-700',
        },
        {
            type: 'paid',
            icon: <CheckCircle className="text-green-600" size={32} />,
            color: 'green',
            title: 'Paid Students',
            description: 'Students who have paid their fees, with transaction IDs, receipt numbers and payment dates.',
            badge: `${paidStudentIds.length} students`,
            badgeColor: 'bg-green-100 text-green-700',
            stat: formatCurrency(totalCollected) + ' collected',
            btnColor: 'bg-green-600 hover:bg-green-700',
        },
        {
            type: 'unpaid',
            icon: <XCircle className="text-red-600" size={32} />,
            color: 'red',
            title: 'Unpaid / Defaulters',
            description: 'Students with pending fees including due dates, overdue flags and contact details.',
            badge: `${unpaidStudentIds.length} students`,
            badgeColor: 'bg-red-100 text-red-700',
            stat: formatCurrency(totalPending) + ' pending',
            btnColor: 'bg-red-600 hover:bg-red-700',
        },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading data...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Export Reports</h1>
                <p className="text-gray-500 mt-1">Generate Excel reports for fee records and student data</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: totalStudents, color: 'blue' },
                    { label: 'Fees Collected', value: formatCurrency(totalCollected), color: 'green' },
                    { label: 'Fees Pending', value: formatCurrency(totalPending), color: 'red' },
                    { label: 'Collection Rate', value: `${(totalCollected / (totalCollected + totalPending) * 100 || 0).toFixed(1)}%`, color: 'purple' },
                ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className={`text-2xl font-bold mt-1 text-${card.color}-600`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map(report => (
                    <div key={report.type} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 bg-${report.color}-50 rounded-xl`}>{report.icon}</div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${report.badgeColor}`}>{report.badge}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{report.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">{report.description}</p>

                            {/* What's included */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-5">
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Includes</p>
                                <div className="space-y-1">
                                    {report.type === 'full' && ['📊 Summary with department breakdown', '👥 All student details', '✅ Paid fee records with receipts', '❌ Unpaid/defaulter list with due dates'].map(item => (
                                        <p key={item} className="text-xs text-gray-600">{item}</p>
                                    ))}
                                    {report.type === 'students' && ['Full name, roll no, department', 'Email, phone, hostel room', 'Bank details', 'Overall fee status'].map(item => (
                                        <p key={item} className="text-xs text-gray-600">• {item}</p>
                                    ))}
                                    {report.type === 'paid' && ['Student info + fee type', 'Amount paid, payment mode', 'Transaction ID & Receipt No', 'Payment date'].map(item => (
                                        <p key={item} className="text-xs text-gray-600">• {item}</p>
                                    ))}
                                    {report.type === 'unpaid' && ['Student info + contact details', 'Amount due, due date', 'Overdue flag ⚠️', 'Remarks'].map(item => (
                                        <p key={item} className="text-xs text-gray-600">• {item}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleExport(report.type)}
                            disabled={!!exporting}
                            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-white font-semibold transition-colors disabled:opacity-60 ${report.btnColor}`}
                        >
                            {exporting === report.type ? (
                                <><Loader size={18} className="animate-spin" /><span>Generating...</span></>
                            ) : (
                                <><Download size={18} /><span>Download Excel</span></>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
                <FileSpreadsheet className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                    <p className="text-sm font-semibold text-blue-800">About these reports</p>
                    <p className="text-sm text-blue-600 mt-1">All reports are generated from live Neon database data. Files are downloaded directly to your computer as <strong>.xlsx</strong> files that open in Microsoft Excel, Google Sheets, or any spreadsheet app.</p>
                </div>
            </div>

        </div>
    );
};

export default ExportPage;