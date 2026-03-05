import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setEmailStatus(null);
      return;
    }
    setEmailStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authAPI.checkEmail(form.email);
        setEmailStatus(res.data.exists ? 'taken' : 'available');
      } catch {
        setEmailStatus(null);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [form.email]);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address.';
    else if (emailStatus === 'taken') e.email = 'This email is already registered.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏢</div>
          <div className="auth-logo-text">HR Platform</div>
          <div className="auth-subtitle">Create your account</div>
        </div>
        {errors.submit && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 14 }}>
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
            />
            {emailStatus === 'checking' && <div className="form-success">Checking availability...</div>}
            {emailStatus === 'available' && !errors.email && <div className="form-success">✓ Email is available</div>}
            {emailStatus === 'taken' && <div className="form-error">Email already registered</div>}
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || emailStatus === 'taken'}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
        <div className="auth-divider"><span>or</span></div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13 }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
