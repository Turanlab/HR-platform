import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const [apiUrl, setApiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:3001/api');

  const handleSave = (e) => {
    e.preventDefault();
    toast('Settings saved (requires restart to take effect).', 'info');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure system settings and integrations.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Account Information</h3>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.7 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" value={user?.role?.replace('_', ' ') || ''} readOnly style={{ opacity: 0.7, textTransform: 'capitalize' }} />
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>API Configuration</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">API Base URL</label>
              <input className="form-input" value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>System Information</h3>
          {[
            ['Platform Version', '1.0.0'],
            ['Max CV Size', '10 MB'],
            ['Supported Formats', 'PDF, DOCX'],
            ['Max Bulk Upload', '50 files'],
            ['Rate Limiting', '20 req/15min (auth)'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
