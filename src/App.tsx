import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, ClipboardList, Receipt, Menu, X } from 'lucide-react';
import AdminDashboard from './components/administration/AdminDashboard';
import AllStudentsPage from './components/administration/AllStudentsPage';
import DRCCStudentsPage from './components/administration/DRCCStudentsPage';
import RefundDashboard from './components/administration/RefundDashboard';
import NoDueDashboard from './components/administration/NoDueDashboard';
import FeeReceiptGenerator from './components/administration/FeeReceiptGenerator';
import { initializeSampleData } from './data/sampleData';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    initializeSampleData();
  }, []);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'students', label: 'All Students', icon: Users },
    { key: 'drcc', label: 'DRCC Students', icon: FileText },
    { key: 'refunds', label: 'Refund Applications', icon: ClipboardList },
    { key: 'nodue', label: 'No Due Clearances', icon: ClipboardList },
    { key: 'receipt', label: 'Generate Receipt', icon: Receipt }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'students':
        return <AllStudentsPage />;
      case 'drcc':
        return <DRCCStudentsPage />;
      case 'refunds':
        return <RefundDashboard />;
      case 'nodue':
        return <NoDueDashboard />;
      case 'receipt':
        return <FeeReceiptGenerator />;
      default:
        return <AdminDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-20'
        } flex flex-col`}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
                <p className="text-xs text-gray-600">MIMIT MALOUT Management</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentPage(item.key);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          {sidebarOpen && (
            <div className="text-center">
              <p className="text-xs text-gray-500">MIMIT MALOUT Management System</p>
              <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {menuItems.find((item) => item.key === currentPage)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
