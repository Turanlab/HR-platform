import React, { useState, useEffect, useCallback } from 'react';
import { candidatesAPI } from '../../services/api';
import { useToast } from '../../components/Toast';

const EMPTY = { name: '', email: '', phone: '', location: '', skills: '', experience_years: '', salary_expectation: '' };

export default function Candidates() {
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', skills: '', location: '' });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await candidatesAPI.list({ page, limit, ...filters });
      setCandidates(res.data.candidates || []);
      setTotal(res.data.total || 0);
    } catch {
      toast('Failed to load candidates.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters, toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setModal({ mode: 'create' }); };
  const openEdit = (c) => { setForm({ ...c, experience_years: c.experience_years ?? '', salary_expectation: c.salary_expectation ?? '' }); setModal({ mode: 'edit', id: c.id }); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast('Name is required.', 'error');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await candidatesAPI.create(form);
        toast('Candidate created!', 'success');
      } else {
        await candidatesAPI.update(modal.id, form);
        toast('Candidate updated!', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await candidatesAPI.delete(id);
      toast('Candidate deleted.', 'success');
      load();
    } catch {
      toast('Failed to delete.', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Candidates</h1>
          <p className="page-subtitle">Manage your candidate database.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Candidate</button>
      </div>

      <div className="filters-bar">
        <input className="filter-input" placeholder="Search name, email, skills..." value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
        <input className="filter-input" placeholder="Filter by skills..." value={filters.skills}
          onChange={e => setFilters(p => ({ ...p, skills: e.target.value }))} />
        <input className="filter-input" placeholder="Filter by location..." value={filters.location}
          onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} />
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">All Candidates ({total})</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : candidates.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><p>No candidates found.</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Location</th><th>Skills</th><th>Experience</th><th>Actions</th></tr></thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="avatar">{c.name[0]}</div>{c.name}</div></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.location || '—'}</td>
                    <td style={{ maxWidth: 200 }}>
                      {c.skills ? c.skills.split(',').slice(0, 3).map(s => (
                        <span key={s} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: 4, fontSize: 12, marginRight: 4 }}>
                          {s.trim()}
                        </span>
                      )) : '—'}
                    </td>
                    <td>{c.experience_years != null ? `${c.experience_years} yrs` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    </td>
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

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal.mode === 'create' ? 'Add Candidate' : 'Edit Candidate'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              {[['name','Name *','text'],['email','Email','email'],['phone','Phone','text'],['location','Location','text'],['skills','Skills (comma-separated)','text'],['experience_years','Years of Experience','number'],['salary_expectation','Salary Expectation','number']].map(([field, label, type]) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} value={form[field] ?? ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
