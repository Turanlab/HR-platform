import React from 'react';

const SKILL_COLORS = [
  { bg: '#ede9fe', text: '#4F46E5' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#f0fdf4', text: '#15803d' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#f0f9ff', text: '#0369a1' },
];

function SkillBadge({ skill, onRemove, color }) {
  const colorSet = color ? { bg: `${color}20`, text: color } : SKILL_COLORS[Math.abs(skill.charCodeAt(0)) % SKILL_COLORS.length];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: colorSet.bg,
        color: colorSet.text,
        padding: '4px 10px',
        borderRadius: '14px',
        fontSize: '13px',
        fontWeight: 500,
        border: `1px solid ${colorSet.text}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colorSet.text,
            padding: '0 0 0 2px',
            fontSize: '14px',
            lineHeight: 1,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default SkillBadge;
