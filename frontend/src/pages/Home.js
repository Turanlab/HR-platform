import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '📤', title: 'Bulk CV Upload', desc: 'Upload hundreds of CVs at once. Support for PDF and DOCX formats with automatic metadata extraction.' },
  { icon: '🔍', title: 'Smart Search', desc: 'Full-text search across skills, experience, location and more. Find the perfect candidate instantly.' },
  { icon: '👥', title: 'Team Collaboration', desc: 'Multiple recruiters can work simultaneously. Role-based access for admins, recruiters and HR managers.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track hiring metrics, team performance and pipeline health with beautiful charts and KPI cards.' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'JWT authentication, rate limiting, audit logs and role-based access control keep your data safe.' },
  { icon: '⚡', title: 'High Performance', desc: 'Optimized for thousands of CVs. Database indexing and pagination ensure fast response times.' },
];

const steps = [
  { num: 1, title: 'Create Account', desc: 'Register your HR team. Assign roles — Admin, HR Manager or Recruiter — to control access.' },
  { num: 2, title: 'Upload CVs', desc: 'Bulk upload candidate CVs in PDF or DOCX. Profiles are created automatically for each file.' },
  { num: 3, title: 'Search & Hire', desc: 'Use powerful filters to find candidates by skills, experience and location. Export to CSV.' },
];

const plans = [
  { name: 'Free', price: '$0', desc: 'Perfect for small teams', features: ['Up to 100 CVs', '3 Team members', 'Basic search', 'Email support'], featured: false },
  { name: 'Team', price: '$49', desc: 'For growing HR teams', features: ['Up to 5,000 CVs', '15 Team members', 'Advanced search & filters', 'Audit logs', 'Priority support', 'CSV export'], featured: true },
  { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Unlimited CVs', 'Unlimited users', 'Custom integrations', 'Dedicated SLA', 'SSO / SAML', 'Custom branding'], featured: false },
];

const faqs = [
  { q: 'What file formats are supported for CV upload?', a: 'We support PDF (.pdf) and Microsoft Word (.docx, .doc) files up to 10MB each.' },
  { q: 'How does bulk upload work?', a: 'Select multiple files at once. Candidate profiles are created automatically using the filename as the candidate name. You can edit profiles afterwards.' },
  { q: 'Is my data secure?', a: 'Yes. All data is stored securely in a PostgreSQL database. JWT tokens protect all API endpoints. Audit logs track every action.' },
  { q: 'Can I export candidate data?', a: 'Yes. Admins and HR managers can export the full candidate list as a CSV file for use in other tools.' },
  { q: 'What roles are available?', a: 'Three roles: Admin (full access), HR Manager (can manage candidates and CVs), and Recruiter (can view and search).' },
];

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

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
          <a href="#how-it-works">How it Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚀 Production-Ready HR Platform</div>
          <h1 className="hero-title">
            Hire Smarter with<br />
            <span className="hero-gradient">AI-Powered CV Management</span>
          </h1>
          <p className="hero-subtitle">
            Upload thousands of CVs, search candidates instantly, and collaborate with your entire HR team — all in one beautiful platform.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start for Free →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              View Demo
            </button>
          </div>
        </div>
        <div className="hero-stats">
          {[['10,000+', 'CVs Processed'], ['99.9%', 'Uptime SLA'], ['3x', 'Faster Hiring'], ['50+', 'HR Teams']].map(([val, label]) => (
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
          <h2 className="section-title">Everything Your HR Team Needs</h2>
          <p className="section-subtitle">A complete platform for managing candidates, CVs and your recruitment pipeline.</p>
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

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="section-header">
          <h2 className="section-title">Up and Running in Minutes</h2>
          <p className="section-subtitle">Three simple steps to transform your hiring process.</p>
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

      {/* Pricing */}
      <section className="section" id="pricing" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-header">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">Choose the plan that fits your team. Upgrade or downgrade at any time.</p>
        </div>
        <div className="pricing-grid">
          {plans.map(p => (
            <div key={p.name} className={`pricing-card ${p.featured ? 'featured' : ''}`}>
              {p.featured && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-name">{p.name}</div>
              <div className="pricing-price">{p.price}<span>/month</span></div>
              <p className="pricing-desc">{p.desc}</p>
              <ul className="pricing-features">
                {p.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button
                className={`btn btn-${p.featured ? 'primary' : 'secondary'}`}
                style={{ width: '100%' }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
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
            <p>A complete, production-ready HR platform for managing candidates, CVs and recruitment workflows.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/admin/dashboard">Dashboard</a>
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
          <p>Built with React & Node.js</p>
        </div>
      </footer>
    </div>
  );
}
