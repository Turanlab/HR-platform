import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';

export default function Users() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'recruiter' });
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listUsers({ limit });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {
      toast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createUser(form);
      toast('User created!', 'success');
      setModal(false);
      setForm({ email: '', password: '', role: 'recruiter' });
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to create user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role);
      toast('Role updated.', 'success');
      load();
    } catch {
      toast('Failed to update role.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast('User deleted.', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete user.', 'error');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage team members and their roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add User</button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">All Users ({total})</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table>
            <thead><tr><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{u.email[0].toUpperCase()}</div>
                      {u.email}
                      {u.id === currentUser?.id && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(you)</span>}
                    </div>
                  </td>
                  <td>
                    <select
                      className="filter-input"
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUser?.id}
                    >
                      <option value="admin">Admin</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="recruiter">Recruiter</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === currentUser?.id}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create User</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="recruiter">Recruiter</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
