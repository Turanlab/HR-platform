import React from 'react';

function CandidateCard({ candidate, onMessage, onViewCV }) {
  const skills = typeof candidate.skills === 'string'
    ? candidate.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : (candidate.skills || []);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        transition: 'box-shadow 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
        {/* Avatar */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: `hsl(${(candidate.id * 37) % 360}, 60%, 65%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          {(candidate.name || '?')[0].toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{candidate.name}</h3>
          <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {candidate.location && <span>📍 {candidate.location}</span>}
            {candidate.experience_years != null && <span>💼 {candidate.experience_years} yr{candidate.experience_years !== 1 ? 's' : ''} exp</span>}
            {candidate.salary_expectation && <span>💰 ${Number(candidate.salary_expectation).toLocaleString()}/yr</span>}
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {skills.slice(0, 6).map((skill, i) => (
            <span key={i} style={{ background: '#ede9fe', color: '#4F46E5', padding: '3px 8px', borderRadius: '10px', fontSize: '12px' }}>
              {skill}
            </span>
          ))}
          {skills.length > 6 && (
            <span style={{ fontSize: '12px', color: '#9ca3af', padding: '3px 0' }}>+{skills.length - 6} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {onViewCV && (
          <button
            onClick={() => onViewCV(candidate)}
            style={{ flex: 1, padding: '8px', background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            View CV
          </button>
        )}
        {onMessage && (
          <button
            onClick={() => onMessage(candidate)}
            style={{ flex: 1, padding: '8px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
}

export default CandidateCard;
