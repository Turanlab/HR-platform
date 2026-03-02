import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.example.com/', // Replace with your API base URL
    timeout: 1000,
    headers: {'Authorization': 'Bearer YOUR_TOKEN'}, // Set Authorization token if required
});

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');

// CV endpoints
export const fetchCV = (userId) => api.get(`/cv/${userId}`);
export const updateCV = (userId, cvData) => api.put(`/cv/${userId}`, cvData);

// Message endpoints
export const fetchMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (messageData) => api.post('/messages', messageData);

// User endpoints
export const fetchUserProfile = (userId) => api.get(`/user/${userId}`);
export const updateUserProfile = (userId, userData) => api.put(`/user/${userId}`, userData);

// Stats endpoints
export const fetchStats = () => api.get('/stats');