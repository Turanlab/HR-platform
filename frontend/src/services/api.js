import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  checkEmail: (email) => api.get('/auth/check-email', { params: { email } }),
  me: () => api.get('/auth/me'),
};

export const candidatesAPI = {
  list: (params) => api.get('/candidates', { params }),
  get: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
};

export const cvsAPI = {
  list: (params) => api.get('/cvs', { params }),
  upload: (formData, onProgress) => api.post('/cvs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }),
  bulkUpload: (formData, onProgress) => api.post('/cvs/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }),
  delete: (id) => api.delete(`/cvs/${id}`),
  download: (id) => api.get(`/cvs/${id}/download`, { responseType: 'blob' }),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const cvBuilderAPI = {
  create: (data) => api.post('/cv-builder', data),
  list: (params) => api.get('/cv-builder', { params }),
  get: (id) => api.get(`/cv-builder/${id}`),
  update: (id, data) => api.put(`/cv-builder/${id}`, data),
  delete: (id) => api.delete(`/cv-builder/${id}`),
  export: (id) => api.post(`/cv-builder/${id}/export`, {}, { responseType: 'blob' }),
  duplicate: (id) => api.post(`/cv-builder/${id}/duplicate`),
};

export const templatesAPI = {
  list: (params) => api.get('/templates', { params }),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

export const aiAPI = {
  parseCV: (formData) => api.post('/ai/parse-cv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  checkGrammar: (text) => api.post('/ai/check-grammar', { text }),
  suggestImprovements: (cvData) => api.post('/ai/suggest-improvements', { cvData }),
  generateCoverLetter: (cvData, jobDescription) => api.post('/ai/generate-cover-letter', { cvData, jobDescription }),
  extractSkills: (text) => api.post('/ai/extract-skills', { text }),
  calculateAtsScore: (cvData, jobDescription) => api.post('/ai/ats-score', { cvData, jobDescription }),
  matchJob: (cvData, jobDescription) => api.post('/ai/match-job', { cvData, jobDescription }),
  getLogs: (params) => api.get('/ai/logs', { params }),
};

export const companiesAPI = {
  create: (formData) => api.post('/companies', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  get: (id) => api.get(`/companies/${id}`),
  update: (id, formData) => api.put(`/companies/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  searchCandidates: (params) => api.get('/companies/search/candidates', { params }),
  getAnalytics: (id) => api.get(`/companies/${id}/analytics`),
  list: (params) => api.get('/companies', { params }),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}`, { params }),
  send: (data) => api.post('/messages', data),
  markRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
};

export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  createCheckout: (data) => api.post('/subscriptions/checkout', data),
  cancel: () => api.post('/subscriptions/cancel'),
  getHistory: () => api.get('/subscriptions/history'),
};

export default api;
