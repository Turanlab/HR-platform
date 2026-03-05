import React, { useEffect, useState } from 'react';
import { adminAPI, cvsAPI } from '../../services/api';

const KPICard = ({ icon, value, label, color }) => (
  <div className="kpi-card">
    <div className={`kpi-icon ${color}`}>{icon}</div>
    <div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentCVs, setRecentCVs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, cvsRes] = await Promise.all([
          adminAPI.stats().catch(() => ({ data: {} })),
          cvsAPI.list({ page: 1, limit: 5 }).catch(() => ({ data: { cvs: [] } })),
        ]);
        setStats(statsRes.data);
        setRecentCVs(cvsRes.data.cvs || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-screen" style={{ minHeight: 'auto', padding: 60 }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening in your HR platform.</p>
      </div>
      <div className="kpi-grid">
        <KPICard icon="📁" value={stats?.total_cvs ?? 0} label="Total CVs" color="purple" />
        <KPICard icon="👥" value={stats?.total_candidates ?? 0} label="Candidates" color="blue" />
        <KPICard icon="🔑" value={stats?.total_users ?? 0} label="Team Members" color="green" />
        <KPICard icon="📋" value={stats?.total_audit_logs ?? 0} label="Audit Events" color="orange" />
      </div>
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Recent CV Uploads</span>
        </div>
        {recentCVs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>No CVs uploaded yet. Go to CV Management to upload your first CV.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>File Name</th><th>Candidate</th><th>Size</th><th>Uploaded</th></tr>
            </thead>
            <tbody>
              {recentCVs.map(cv => (
                <tr key={cv.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      📄 {cv.file_name}
                      <span className={`badge badge-${cv.file_name?.endsWith('.pdf') ? 'pdf' : 'docx'}`}>
                        {cv.file_name?.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td>{cv.candidate_name || '—'}</td>
                  <td>{cv.file_size ? `${Math.round(cv.file_size / 1024)} KB` : '—'}</td>
                  <td>{new Date(cv.uploaded_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
