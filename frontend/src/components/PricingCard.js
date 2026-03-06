import React from 'react';

const CHECK_ICON = '✓';

function PricingCard({ plan, isCurrentPlan, onSelect }) {
  const isPopular = plan.id === 'premium' || plan.id === 'company_professional';

  return (
    <div
      style={{
        border: isCurrentPlan ? '2px solid #4F46E5' : isPopular ? '2px solid #818cf8' : '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '32px 28px',
        background: isCurrentPlan ? 'linear-gradient(135deg, #ede9fe 0%, #f0f9ff 100%)' : '#fff',
        position: 'relative',
        boxShadow: isPopular ? '0 10px 40px rgba(79,70,229,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        flex: 1,
        minWidth: '240px',
        maxWidth: '340px',
      }}
    >
      {isPopular && !isCurrentPlan && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 16px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          MOST POPULAR
        </div>
      )}

      {isCurrentPlan && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#10b981',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 16px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          CURRENT PLAN
        </div>
      )}

      <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{plan.name}</h3>

      <div style={{ margin: '16px 0' }}>
        <span style={{ fontSize: '40px', fontWeight: 800, color: '#1f2937' }}>
          ${plan.price}
        </span>
        {plan.price > 0 && (
          <span style={{ fontSize: '14px', color: '#6b7280' }}>/month</span>
        )}
        {plan.price === 0 && (
          <span style={{ fontSize: '14px', color: '#6b7280' }}> forever</span>
        )}
        {plan.annual_price > 0 && (
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            ${plan.annual_price}/year — save {Math.round(100 - (plan.annual_price / (plan.price * 12)) * 100)}%
          </div>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(plan.features || []).map((feature, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#374151' }}>
            <span style={{ color: '#4F46E5', fontWeight: 700, flexShrink: 0 }}>{CHECK_ICON}</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isCurrentPlan && onSelect && onSelect(plan)}
        disabled={isCurrentPlan}
        style={{
          width: '100%',
          padding: '12px',
          background: isCurrentPlan ? '#e5e7eb' : isPopular ? 'linear-gradient(135deg, #4F46E5, #7c3aed)' : '#1f2937',
          color: isCurrentPlan ? '#6b7280' : '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: isCurrentPlan ? 'default' : 'pointer',
        }}
      >
        {isCurrentPlan ? 'Current Plan' : plan.cta || 'Get Started'}
      </button>
    </div>
  );
}

export default PricingCard;
