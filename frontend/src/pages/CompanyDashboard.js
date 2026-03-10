import React, { useState, useEffect } from 'react';
import CandidateCard from '../components/CandidateCard';
import SubscriptionBadge from '../components/SubscriptionBadge';
import { companiesAPI, subscriptionsAPI } from '../services/api';
import { notifyError } from '../components/Notification';
import { useNavigate } from 'react-router-dom';

const STATS_ICONS = { profile_views: '👁️', candidate_searches: '🔍', messages_sent: '💬', candidates_contacted: '🤝' };

export default function CompanyDashboard() {
  const [analytics] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', skills: '', location: '', min_experience: '', max_experience: '' });
  const navigate = useNavigate();

  useEffect(() => {
    subscriptionsAPI.getCurrent().then((res) => setSubscription(res.data.subscription)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await companiesAPI.searchCandidates(params);
      setCandidates(res.data.candidates || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      notifyError(err.response?.data?.error || 'Search failed.');
    }
    setLoading(false);
  };

  const handleMessage = (candidate) => {
    navigate('/messages', { state: { contactUserId: candidate.user_id } });
  };

  const filterStyle = { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 700, color: '#1f2937' }}>Company Dashboard</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>Find and connect with top talent</p>
          </div>
          {subscription && (
            <SubscriptionBadge tier={subscription.plan || 'free'} onUpgrade={() => navigate('/pricing')} />
          )}
        </div>

        {/* Analytics cards */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {Object.entries(analytics).filter(([k]) => k !== 'period').map(([key, value]) => (
              <div key={key} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>{STATS_ICONS[key] || '📊'}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#4F46E5' }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search form */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 600, color: '#1f2937' }}>🔍 Search Candidates</h2>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Name, email, keyword..." style={filterStyle} />
            <input value={filters.skills} onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))} placeholder="Skills (e.g. React, Python)" style={filterStyle} />
            <input value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} placeholder="Location" style={filterStyle} />
            <input type="number" value={filters.min_experience} onChange={(e) => setFilters((f) => ({ ...f, min_experience: e.target.value }))} placeholder="Min experience (years)" style={filterStyle} />
            <input type="number" value={filters.max_experience} onChange={(e) => setFilters((f) => ({ ...f, max_experience: e.target.value }))} placeholder="Max experience (years)" style={filterStyle} />
            <button type="submit" disabled={loading} style={{ padding: '9px 20px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        {candidates.length > 0 && (
          <div>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6b7280' }}>Found {total} candidate{total !== 1 ? 's' : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {candidates.map((c) => (
                <CandidateCard key={c.id} candidate={c} onMessage={handleMessage} onViewCV={() => {}} />
              ))}
            </div>
          </div>
        )}

        {!loading && candidates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '16px' }}>Use the search form above to find candidates matching your requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
}
