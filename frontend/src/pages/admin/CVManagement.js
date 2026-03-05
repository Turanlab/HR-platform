import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cvsAPI } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function CVManagement() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [cvs, setCVs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cvsAPI.list({ page, limit });
      setCVs(res.data.cvs || []);
      setTotal(res.data.total || 0);
    } catch {
      toast('Failed to load CVs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('cvs', f));
    setUploading(true);
    setUploadProgress(0);
    try {
      await cvsAPI.bulkUpload(formData, (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      toast(`${files.length} CV(s) uploaded successfully!`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this CV?')) return;
    try {
      await cvsAPI.delete(id);
      toast('CV deleted.', 'success');
      load();
    } catch {
      toast('Failed to delete CV.', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">CV Management</h1>
        <p className="page-subtitle">Upload, search and manage candidate CVs.</p>
      </div>

      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        style={{ marginBottom: 24 }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div>
            <div className="upload-title">Uploading... {uploadProgress}%</div>
            <div className="progress-bar-container" style={{ maxWidth: 300, margin: '12px auto 0' }}>
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="upload-icon">📤</div>
            <div className="upload-title">Drop CVs here or click to browse</div>
            <div className="upload-subtitle">Supports PDF and DOCX • Max 10MB per file • Bulk upload supported</div>
          </>
        )}
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">All CVs ({total})</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : cvs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>No CVs found. Upload some CVs above.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr><th>File</th><th>Candidate</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {cvs.map(cv => (
                  <tr key={cv.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        📄 {cv.file_name}
                        <span className={`badge badge-${cv.file_name?.endsWith('.pdf') ? 'pdf' : 'docx'}`}>
                          {cv.file_name?.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>{cv.candidate_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{cv.file_size ? `${Math.round(cv.file_size / 1024)} KB` : '—'}</td>
                    <td>{new Date(cv.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cv.id)}>Delete</button>
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
    </div>
  );
}
