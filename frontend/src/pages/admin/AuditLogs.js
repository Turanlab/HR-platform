import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/Toast';

const actionColors = {
  LOGIN: 'blue', REGISTER: 'green', UPLOAD_CV: 'purple',
  BULK_UPLOAD_CVS: 'purple', DELETE_CV: 'danger',
  CREATE_CANDIDATE: 'green', UPDATE_CANDIDATE: 'blue',
  DELETE_CANDIDATE: 'danger', CREATE_USER: 'green',
  UPDATE_USER_ROLE: 'blue', DELETE_USER: 'danger',
};

export default function AuditLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.auditLogs({ page, limit });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch {
      toast('Failed to load audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Complete history of all actions performed in the system.</p>
      </div>
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">All Events ({total})</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><p>No audit logs yet.</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>{log.user_email || <span style={{ color: 'var(--text-muted)' }}>System</span>}</td>
                    <td>
                      <span className={`badge badge-${actionColors[log.action] || 'active'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>{log.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
