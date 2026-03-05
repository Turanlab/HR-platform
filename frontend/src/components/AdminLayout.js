import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ToastProvider } from './Toast';

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Overview' },
  { to: '/admin/cvs', icon: '📁', label: 'CV Management' },
  { to: '/admin/candidates', icon: '👥', label: 'Candidates' },
  { to: '/admin/users', icon: '🔑', label: 'Users' },
  { to: '/admin/audit-logs', icon: '📋', label: 'Audit Logs' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ToastProvider>
      <div className="admin-layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🏢</div>
            <span className="sidebar-logo-text">HR Platform</span>
          </div>
          <nav className="sidebar-nav">
            <div className="sidebar-section-title">Main Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main-content">
          <header className="topbar">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 22, cursor: 'pointer', display: 'none' }}
              className="mobile-menu-btn"
            >
              ☰
            </button>
            <div className="topbar-search">
              <span className="topbar-search-icon">🔍</span>
              <input type="text" placeholder="Search candidates, CVs..." />
            </div>
            <div className="topbar-actions">
              <div className="dropdown">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <div className="avatar">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item">
                      <span>👤</span> Profile
                    </div>
                    <div className="dropdown-item danger" onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
