import React from 'react';

function AIAssistant({ suggestions = [], atsScore = null, isLoading = false, onApply }) {
  const scoreColor = atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>AI Assistant</h3>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>Smart suggestions to improve your CV</p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Loading state */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#4F46E5' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <p style={{ margin: 0, fontSize: '14px' }}>Analyzing your CV…</p>
          </div>
        )}

        {/* ATS Score */}
        {!isLoading && atsScore !== null && (
          <div style={{ marginBottom: '20px', padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>ATS Compatibility Score</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: scoreColor }}>{atsScore}%</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${atsScore}%`,
                  height: '100%',
                  background: scoreColor,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#6b7280' }}>
              {atsScore >= 80 ? '✅ Excellent! Your CV is highly ATS-compatible.' : atsScore >= 60 ? '⚠️ Good, but there\'s room for improvement.' : '❌ Your CV may get filtered by ATS systems.'}
            </p>
          </div>
        )}

        {/* Suggestions */}
        {!isLoading && suggestions.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Suggestions ({suggestions.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map((s, i) => {
                const priorityColor = s.priority === 'high' ? '#ef4444' : s.priority === 'medium' ? '#f59e0b' : '#10b981';
                return (
                  <div key={i} style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: `1px solid ${priorityColor}30`, borderLeft: `3px solid ${priorityColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{s.section || 'General'}</span>
                      {s.priority && (
                        <span style={{ fontSize: '10px', background: `${priorityColor}20`, color: priorityColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                          {s.priority}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: 1.5 }}>{s.suggestion || s.text || s}</p>
                    {onApply && s.suggestion && (
                      <button
                        onClick={() => onApply(s)}
                        style={{ marginTop: '8px', padding: '4px 10px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && suggestions.length === 0 && atsScore === null && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
            <p style={{ margin: 0, fontSize: '13px' }}>Fill in your CV details to get AI-powered suggestions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
