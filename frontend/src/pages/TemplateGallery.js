import React, { useState, useEffect } from 'react';
import TemplateCard from '../components/TemplateCard';
import { templatesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Professional', 'Creative', 'Simple', 'Academic', 'Modern'];

export default function TemplateGallery() {
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (showPremiumOnly) params.is_premium = true;

    templatesAPI.list(params)
      .then((res) => {
        setTemplates(res.data.templates || []);
        setTotal(res.data.total || 0);
        setHasPremiumAccess(res.data.has_premium_access || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, showPremiumOnly]);

  const filtered = templates.filter((t) =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>CV Templates</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Choose from {total} professional templates to make your CV stand out</p>
        </div>

        {/* Upgrade banner */}
        {!hasPremiumAccess && (
          <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>✨ Unlock Premium Templates</h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Get access to 12+ premium designs for just $9.99/month</p>
            </div>
            <button onClick={() => navigate('/pricing')} style={{ padding: '10px 20px', background: '#fff', color: '#4F46E5', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Upgrade Now
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            style={{ flex: 1, minWidth: '200px', padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          />

          {/* Category buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#4F46E5' : '#d1d5db',
                  background: selectedCategory === cat ? '#4F46E5' : '#fff',
                  color: selectedCategory === cat ? '#fff' : '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Premium toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={showPremiumOnly}
              onChange={(e) => setShowPremiumOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Premium only
          </label>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <p>Loading templates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
            <p>No templates found matching your criteria.</p>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>Showing {filtered.length} templates</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => navigate('/cv-builder', { state: { templateId: template.id } })}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
