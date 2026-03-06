import React from 'react';

const TIER_CONFIG = {
  free: { label: 'Free', bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
  premium: { label: 'Premium', bg: '#ede9fe', text: '#4F46E5', border: '#a5b4fc' },
  professional: { label: 'Professional', bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  starter: { label: 'Starter', bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
  company_professional: { label: 'Pro', bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  enterprise: { label: 'Enterprise', bg: '#fce7f3', text: '#db2777', border: '#f9a8d4' },
};

function SubscriptionBadge({ tier = 'free', onUpgrade }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const isFree = tier === 'free';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: config.bg,
          color: config.text,
          border: `1px solid ${config.border}`,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {!isFree && <span>⭐</span>}
        {config.label}
      </span>
      {isFree && onUpgrade && (
        <button
          onClick={onUpgrade}
          style={{
            padding: '4px 12px',
            background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Upgrade ↑
        </button>
      )}
    </div>
  );
}

export default SubscriptionBadge;
