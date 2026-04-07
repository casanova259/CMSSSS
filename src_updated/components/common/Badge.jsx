const Badge = ({ status, label }) => {
  const colors = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    unpaid: 'bg-red-100 text-red-800 border-red-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    complete: 'bg-green-100 text-green-800 border-green-200',
    issues: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {label || status.toUpperCase()}
    </span>
  );
};

export default Badge;
