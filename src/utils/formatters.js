export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateChange = (current, previous) => {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

export const generateReceiptNo = () => {
  return `REC${Date.now()}`;
};

export const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};
