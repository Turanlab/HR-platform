import React from 'react';

function CVPreview({ cvData, template }) {
  const { personal_info = {}, experience = [], education = [], skills = [], languages = [], certifications = [], summary = '' } = cvData || {};

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    lineHeight: 1.6,
    padding: '40px',
    background: '#fff',
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '600px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderRadius: '4px',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '3px solid #4F46E5', paddingBottom: '16px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>
          {personal_info.full_name || 'Your Name'}
        </h1>
        {personal_info.title && (
          <p style={{ margin: '0 0 8px', fontSize: '16px', color: '#4F46E5', fontWeight: 500 }}>{personal_info.title}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#555' }}>
          {personal_info.email && <span>📧 {personal_info.email}</span>}
          {personal_info.phone && <span>📞 {personal_info.phone}</span>}
          {personal_info.location && <span>📍 {personal_info.location}</span>}
          {personal_info.website && <span>🌐 {personal_info.website}</span>}
          {personal_info.linkedin && <span>💼 {personal_info.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Summary</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#1f2937' }}>{exp.title || 'Position'}</div>
                  <div style={{ fontSize: '13px', color: '#4F46E5' }}>{exp.company || 'Company'}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap' }}>{exp.duration || exp.start_date || ''}</div>
              </div>
              {exp.description && <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#555' }}>{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{edu.degree || 'Degree'}</div>
                <div style={{ fontSize: '13px', color: '#555' }}>{edu.institution || 'Institution'}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#777' }}>{edu.year || edu.end_date || ''}</div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, i) => (
              <span key={i} style={{ background: '#ede9fe', color: '#4F46E5', padding: '4px 12px', borderRadius: '14px', fontSize: '13px', fontWeight: 500 }}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Languages</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {languages.map((lang, i) => (
              <span key={i} style={{ fontSize: '13px', color: '#374151' }}>
                <strong>{typeof lang === 'object' ? lang.name : lang}</strong>
                {typeof lang === 'object' && lang.level && ` — ${lang.level}`}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Certifications</h2>
          {certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
              <strong>{typeof cert === 'object' ? cert.name : cert}</strong>
              {typeof cert === 'object' && cert.issuer && ` — ${cert.issuer}`}
              {typeof cert === 'object' && cert.year && ` (${cert.year})`}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default CVPreview;
