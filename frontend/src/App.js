import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/admin/Dashboard';
import CVManagement from './pages/admin/CVManagement';
import Candidates from './pages/admin/Candidates';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import AuditLogs from './pages/admin/AuditLogs';
import AdminLayout from './components/AdminLayout';
import CVBuilder from './pages/CVBuilder';
import TemplateGallery from './pages/TemplateGallery';
import Pricing from './pages/Pricing';
import CompanyDashboard from './pages/CompanyDashboard';
import Messaging from './pages/Messaging';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/cv-builder" element={<ProtectedRoute><CVBuilder /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><TemplateGallery /></ProtectedRoute>} />
          <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cvs" element={<CVManagement />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
