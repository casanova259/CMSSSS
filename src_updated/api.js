const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const studentsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/students${qs ? '?' + qs : ''}`);
  },
  getById: (id) => request(`/students/${id}`),
  create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
};

export const feesAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/fees${qs ? '?' + qs : ''}`);
  },
  getByStudent: (studentId) => request(`/fees/student/${studentId}`),
  getSummary: () => request('/fees/stats/summary'),
  create: (data) => request('/fees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  markPaid: (id, { paymentMode, transactionId, receiptNo }) =>
    request(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMode, transactionId, receiptNo,
      }),
    }),
};

export const drccAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/drcc${qs ? '?' + qs : ''}`);
  },
  getById: (id) => request(`/drcc/${id}`),
  create: (data) => request('/drcc', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/drcc/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approve: (id, processedBy, comments) =>
    request(`/drcc/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'approved', processedBy, comments }) }),
  reject: (id, processedBy, rejectionReason) =>
    request(`/drcc/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'rejected', processedBy, rejectionReason }) }),
};

export const noDueAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/no-due${qs ? '?' + qs : ''}`);
  },
  getById: (id) => request(`/no-due/${id}`),
  create: (studentId) =>
    request('/no-due', { method: 'POST', body: JSON.stringify({ studentId }) }),
  updateClearance: (appId, dept, data) =>
    request(`/no-due/${appId}/clearance/${dept}`, { method: 'PUT', body: JSON.stringify(data) }),
  generateCertificate: (id) =>
    request(`/no-due/${id}/certificate`, { method: 'PUT' }),
};
