import React from 'react';

const GRADIENT_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
];

function TemplateCard({ template, onSelect, isSelected }) {
  const gradient = GRADIENT_COLORS[template.id % GRADIENT_COLORS.length];

  return (
    <div
      style={{
        border: isSelected ? '2px solid #4F46E5' : '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isSelected ? '0 0 0 3px rgba(79,70,229,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
        background: '#fff',
      }}
      onClick={() => onSelect && onSelect(template)}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: '140px',
          background: template.thumbnail_url ? `url(${template.thumbnail_url}) center/cover` : gradient,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!template.thumbnail_url && (
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px' }}>
            {template.name}
          </span>
        )}
        {template.is_premium && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '10px',
              letterSpacing: '0.5px',
            }}
          >
            PREMIUM
          </span>
        )}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(79,70,229,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '32px' }}>✓</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{template.name}</h3>
          <span
            style={{
              fontSize: '11px',
              color: '#6b7280',
              background: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {template.category}
          </span>
        </div>
        {template.description && (
          <p style={{ margin: '4px 0 10px', fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
            {template.description.substring(0, 80)}{template.description.length > 80 ? '…' : ''}
          </p>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect && onSelect(template); }}
          style={{
            width: '100%',
            padding: '7px',
            background: isSelected ? '#4F46E5' : '#f9fafb',
            color: isSelected ? '#fff' : '#374151',
            border: `1px solid ${isSelected ? '#4F46E5' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {isSelected ? '✓ Selected' : 'Use Template'}
        </button>
      </div>
    </div>
  );
}

export default TemplateCard;
