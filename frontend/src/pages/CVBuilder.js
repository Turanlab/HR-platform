import React, { useState, useEffect } from 'react';
import CVPreview from '../components/CVPreview';
import AIAssistant from '../components/AIAssistant';
import SkillBadge from '../components/SkillBadge';
import TemplateCard from '../components/TemplateCard';
import { cvBuilderAPI, templatesAPI, aiAPI } from '../services/api';
import { notifySuccess, notifyError } from '../components/Notification';

const INITIAL_CV = {
  title: 'My CV',
  template_id: null,
  personal_info: { full_name: '', email: '', phone: '', location: '', title: '', website: '', linkedin: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
};

function Section({ title, children, onAdd, addLabel }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>{title}</h3>
        {onAdd && (
          <button onClick={onAdd} style={{ padding: '4px 10px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            + {addLabel || 'Add'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, rows }) {
  const style = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
  return (
    <div style={{ marginBottom: '10px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{label}</label>}
      {rows ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...style, resize: 'vertical' }} /> : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={style} />}
    </div>
  );
}

export default function CVBuilder() {
  const [cvData, setCvData] = useState(INITIAL_CV);
  const [cvId, setCvId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [atsScore, setAtsScore] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    templatesAPI.list({ limit: 20 }).then((res) => setTemplates(res.data.templates || [])).catch(() => {});
  }, []);

  const updateField = (path, value) => {
    setCvData((prev) => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [path]: value };
      return { ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: value } };
    });
  };

  const addExperience = () => {
    setCvData((prev) => ({ ...prev, experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }] }));
  };

  const updateExperience = (i, field, value) => {
    setCvData((prev) => ({ ...prev, experience: prev.experience.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));
  };

  const removeExperience = (i) => {
    setCvData((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
  };

  const addEducation = () => {
    setCvData((prev) => ({ ...prev, education: [...prev.education, { degree: '', institution: '', year: '' }] }));
  };

  const updateEducation = (i, field, value) => {
    setCvData((prev) => ({ ...prev, education: prev.education.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));
  };

  const removeEducation = (i) => {
    setCvData((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || cvData.skills.includes(s)) return;
    setCvData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setCvData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...cvData };
      if (cvId) {
        await cvBuilderAPI.update(cvId, payload);
        notifySuccess('CV saved successfully!');
      } else {
        const res = await cvBuilderAPI.create(payload);
        setCvId(res.data.cv.id);
        notifySuccess('CV created successfully!');
      }
    } catch {
      notifyError('Failed to save CV. Please try again.');
    }
    setSaving(false);
  };

  const handleExport = async () => {
    if (!cvId) { notifyError('Please save your CV first.'); return; }
    try {
      const res = await cvBuilderAPI.export(cvId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/html' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.title}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notifyError('Export failed.');
    }
  };

  const handleGetAISuggestions = async () => {
    setAiLoading(true);
    try {
      const [suggestRes, atsRes] = await Promise.allSettled([
        aiAPI.suggestImprovements(cvData),
        aiAPI.calculateAtsScore(cvData, 'software engineer position requiring JavaScript, React, problem solving, teamwork'),
      ]);
      if (suggestRes.status === 'fulfilled') setAiSuggestions(suggestRes.value.data.suggestions || []);
      if (atsRes.status === 'fulfilled') setAtsScore(atsRes.value.data.score);
    } catch {}
    setAiLoading(false);
  };

  const SECTIONS = [
    { id: 'personal', label: '👤 Personal' },
    { id: 'summary', label: '📝 Summary' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'education', label: '🎓 Education' },
    { id: 'skills', label: '⚡ Skills' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb', overflow: 'hidden' }}>
      {/* Left: Form */}
      <div style={{ width: '320px', background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)' }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 700 }}>CV Builder</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Build your professional CV</p>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: activeSection === s.id ? 600 : 400, color: activeSection === s.id ? '#4F46E5' : '#6b7280', borderBottom: activeSection === s.id ? '2px solid #4F46E5' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* CV Title */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <Input value={cvData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="CV Title" />
        </div>

        {/* Form content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {activeSection === 'personal' && (
            <Section title="Personal Information">
              <Input label="Full Name" value={cvData.personal_info.full_name} onChange={(e) => updateField('personal_info.full_name', e.target.value)} placeholder="John Doe" />
              <Input label="Professional Title" value={cvData.personal_info.title} onChange={(e) => updateField('personal_info.title', e.target.value)} placeholder="Software Engineer" />
              <Input label="Email" value={cvData.personal_info.email} onChange={(e) => updateField('personal_info.email', e.target.value)} type="email" placeholder="john@example.com" />
              <Input label="Phone" value={cvData.personal_info.phone} onChange={(e) => updateField('personal_info.phone', e.target.value)} placeholder="+1 234 567 890" />
              <Input label="Location" value={cvData.personal_info.location} onChange={(e) => updateField('personal_info.location', e.target.value)} placeholder="New York, USA" />
              <Input label="Website" value={cvData.personal_info.website} onChange={(e) => updateField('personal_info.website', e.target.value)} placeholder="https://yoursite.com" />
              <Input label="LinkedIn" value={cvData.personal_info.linkedin} onChange={(e) => updateField('personal_info.linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" />
            </Section>
          )}

          {activeSection === 'summary' && (
            <Section title="Professional Summary">
              <Input value={cvData.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Write a compelling professional summary..." rows={6} />
            </Section>
          )}

          {activeSection === 'experience' && (
            <Section title="Work Experience" onAdd={addExperience} addLabel="Experience">
              {cvData.experience.map((exp, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Experience {i + 1}</span>
                    <button onClick={() => removeExperience(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                  </div>
                  <Input value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)} placeholder="Job Title" />
                  <Input value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} placeholder="Company Name" />
                  <Input value={exp.duration} onChange={(e) => updateExperience(i, 'duration', e.target.value)} placeholder="2020 - 2023" />
                  <Input value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} placeholder="Describe your responsibilities..." rows={3} />
                </div>
              ))}
              {cvData.experience.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>No experience added yet.</p>}
            </Section>
          )}

          {activeSection === 'education' && (
            <Section title="Education" onAdd={addEducation} addLabel="Education">
              {cvData.education.map((edu, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Education {i + 1}</span>
                    <button onClick={() => removeEducation(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                  </div>
                  <Input value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} placeholder="Degree / Certificate" />
                  <Input value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} placeholder="Institution Name" />
                  <Input value={edu.year} onChange={(e) => updateEducation(i, 'year', e.target.value)} placeholder="Graduation Year" />
                </div>
              ))}
              {cvData.education.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>No education added yet.</p>}
            </Section>
          )}

          {activeSection === 'skills' && (
            <Section title="Skills">
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill..."
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                />
                <button onClick={addSkill} style={{ padding: '8px 12px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cvData.skills.map((skill) => <SkillBadge key={skill} skill={skill} onRemove={removeSkill} />)}
              </div>
            </Section>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleGetAISuggestions} disabled={aiLoading} style={{ padding: '8px', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, opacity: aiLoading ? 0.7 : 1 }}>
            {aiLoading ? '⏳ Analyzing...' : '🤖 Get AI Suggestions'}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              {saving ? 'Saving...' : '💾 Save'}
            </button>
            <button onClick={handleExport} style={{ flex: 1, padding: '8px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              📄 Export
            </button>
          </div>
        </div>
      </div>

      {/* Center: Preview */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Live Preview</h2>
          <button onClick={() => setShowTemplates((v) => !v)} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
            🎨 {showTemplates ? 'Hide' : 'Choose'} Template
          </button>
        </div>

        {showTemplates && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600 }}>Select a Template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} isSelected={cvData.template_id === t.id} onSelect={(tmpl) => { updateField('template_id', tmpl.id); setShowTemplates(false); }} />
              ))}
            </div>
          </div>
        )}

        <CVPreview cvData={cvData} template={templates.find((t) => t.id === cvData.template_id)} />
      </div>

      {/* Right: AI Assistant */}
      <div style={{ width: '280px', padding: '24px 16px', overflowY: 'auto', borderLeft: '1px solid #e5e7eb', background: '#fafafa' }}>
        <AIAssistant suggestions={aiSuggestions} atsScore={atsScore} isLoading={aiLoading} />
      </div>
    </div>
  );
}
