import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-green-500', icon: CheckCircle },
    error: { bg: 'bg-red-500', icon: AlertCircle },
    info: { bg: 'bg-blue-500', icon: Info },
    warning: { bg: 'bg-yellow-500', icon: AlertTriangle }
  };

  const { bg, icon: Icon } = config[type];

  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-slide-in min-w-[300px]`}>
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;
