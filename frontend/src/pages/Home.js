import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🤖', title: 'AI-Powered CV Builder', desc: 'Build professional CVs with real-time AI suggestions, grammar checks, and ATS optimization to land more interviews.' },
  { icon: '🎨', title: '20+ Premium Templates', desc: 'Choose from beautifully designed templates — Professional, Creative, Academic, and more. Updated regularly.' },
  { icon: '📊', title: 'ATS Score Checker', desc: 'Get instant feedback on how well your CV will perform against Applicant Tracking Systems used by top companies.' },
  { icon: '💬', title: 'Real-time Messaging', desc: 'Connect directly with recruiters and companies via built-in messaging. Get notified instantly.' },
  { icon: '🏢', title: 'Company Portal', desc: 'Companies can search candidates by skills, location and experience. Advanced filters for precision hiring.' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'JWT authentication, rate limiting, audit logs and role-based access control keep your data safe.' },
];

const steps = [
  { num: 1, title: 'Create Your Account', desc: 'Sign up for free in seconds. No credit card required to get started with basic features.' },
  { num: 2, title: 'Build Your CV', desc: 'Use our AI-powered CV builder with live preview. Pick a template, fill in your details, get AI suggestions.' },
  { num: 3, title: 'Get Hired', desc: 'Export your polished CV, match it with jobs, and connect with companies directly through messaging.' },
];

const templatePreviews = [
  { name: 'Classic Professional', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', category: 'Professional' },
  { name: 'Modern Minimalist', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', category: 'Simple' },
  { name: 'Creative Blue', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', category: 'Creative' },
  { name: 'Tech Developer', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', category: 'Professional' },
];

const faqs = [
  { q: 'Is the CV builder really free?', a: 'Yes! Our free plan includes 3 templates and 1 active CV. Upgrade to Premium for unlimited templates and AI features.' },
  { q: 'How does the AI assistance work?', a: 'Our AI analyzes your CV content and provides suggestions for improvements, grammar corrections, and keyword optimization for ATS systems.' },
  { q: 'Can I export my CV as PDF?', a: 'Yes. All plans include HTML export. Premium plans offer additional export formats. You can print the HTML to PDF using your browser.' },
  { q: 'How does company search work?', a: 'Companies on our platform can search candidates by skills, experience, location, and salary expectations with advanced filtering.' },
  { q: 'Is my data secure?', a: 'Absolutely. Your data is encrypted, stored securely, and never shared with third parties without your consent.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveTemplate((i) => (i + 1) % templatePreviews.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="nav-landing">
        <div className="nav-logo">
          <div className="nav-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>🏢</div>
          HR Platform
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', color: 'inherit' }} onClick={() => navigate('/pricing')}>Pricing</button>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚀 Now with AI-Powered CV Builder</div>
          <h1 className="hero-title">
            Build Your Dream CV<br />
            <span className="hero-gradient">Land Your Dream Job</span>
          </h1>
          <p className="hero-subtitle">
            Create stunning, ATS-optimized CVs with AI assistance. Choose from 20+ professional templates and connect directly with top companies.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Get Started Free →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/templates')}>
              View Templates
            </button>
          </div>
        </div>
        <div className="hero-stats">
          {[['20+', 'CV Templates'], ['AI', 'Powered Builder'], ['ATS', 'Optimized'], ['Real-time', 'Messaging']].map(([val, label]) => (
            <div key={label} className="hero-stat">
              <div className="hero-stat-value">{val}</div>
              <div className="hero-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Get Hired</h2>
          <p className="section-subtitle">A complete platform for job seekers and companies alike.</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Template preview */}
      <section className="section" id="templates">
        <div className="section-header">
          <h2 className="section-title">Professional Templates</h2>
          <p className="section-subtitle">Hand-crafted designs for every industry and career level.</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          {templatePreviews.map((t, i) => (
            <div
              key={i}
              onClick={() => setActiveTemplate(i)}
              style={{
                width: '160px', height: '200px', borderRadius: '12px', background: t.gradient, cursor: 'pointer',
                border: activeTemplate === i ? '3px solid #4F46E5' : '3px solid transparent',
                transform: activeTemplate === i ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '12px',
                boxShadow: activeTemplate === i ? '0 10px 30px rgba(79,70,229,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{t.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>{t.category}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/templates')}
            style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            View All 20+ Templates →
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-header">
          <h2 className="section-title">Get Hired in 3 Simple Steps</h2>
          <p className="section-subtitle">From registration to your dream job — all in one platform.</p>
        </div>
        <div className="steps-grid">
          {steps.map(s => (
            <div key={s.num} className="step-card">
              <div className="step-number">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="section" id="pricing">
        <div className="section-header">
          <h2 className="section-title">Pricing for Everyone</h2>
          <p className="section-subtitle">Start free, upgrade when you're ready.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          {[
            { name: 'Free', price: '$0', features: ['3 CV templates', 'Basic CV builder', '1 active CV', 'PDF export'], cta: 'Start Free', primary: false },
            { name: 'Premium', price: '$9.99/mo', features: ['All 20+ templates', 'AI grammar check', 'ATS score', 'Cover letter generator'], cta: 'Go Premium', primary: true },
            { name: 'Professional', price: '$19.99/mo', features: ['Unlimited CVs', 'AI skill extraction', 'Job match scoring', 'Advanced analytics'], cta: 'Go Pro', primary: false },
          ].map((p) => (
            <div key={p.name} style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: p.primary ? '2px solid #4F46E5' : '1px solid #e5e7eb', minWidth: '220px', maxWidth: '280px', flex: 1, boxShadow: p.primary ? '0 8px 30px rgba(79,70,229,0.15)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
              {p.primary && <div style={{ background: '#4F46E5', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', display: 'inline-block', marginBottom: '8px' }}>MOST POPULAR</div>}
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>{p.name}</h3>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4F46E5', margin: '8px 0 16px' }}>{p.price}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {p.features.map((f) => <li key={f} style={{ fontSize: '13px', color: '#374151' }}>✓ {f}</li>)}
              </ul>
              <button onClick={() => navigate('/register')} style={{ width: '100%', padding: '10px', background: p.primary ? '#4F46E5' : '#f9fafb', color: p.primary ? '#fff' : '#374151', border: `1px solid ${p.primary ? '#4F46E5' : '#d1d5db'}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px', fontWeight: 500, textDecoration: 'underline' }}>
            See full pricing details →
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="nav-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>🏢</div>
              HR Platform
            </div>
            <p>Build stunning CVs, connect with companies, and land your dream job with AI-powered tools.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 'inherit' }} onClick={() => navigate('/pricing')}>Pricing</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 'inherit' }} onClick={() => navigate('/templates')}>Templates</button>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 'inherit' }} onClick={() => navigate('/login')}>Login</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 'inherit' }} onClick={() => navigate('/register')}>Register</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 'inherit' }} onClick={() => navigate('/cv-builder')}>CV Builder</button>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#security">Security</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} HR Platform. All rights reserved.</p>
          <p>Built with React, Node.js & AI</p>
        </div>
      </footer>
    </div>
  );
}
