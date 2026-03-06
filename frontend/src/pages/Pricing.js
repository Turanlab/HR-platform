import React, { useState, useEffect } from 'react';
import PricingCard from '../components/PricingCard';
import { subscriptionsAPI } from '../services/api';
import { notifySuccess, notifyError } from '../components/Notification';
import { useNavigate } from 'react-router-dom';

const FAQ = [
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your subscription at any time. Your access continues until the end of the current billing period.' },
  { q: 'Is there a free trial?', a: 'We offer a free plan with access to 3 basic templates and core features. No credit card required to get started.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment processor.' },
  { q: 'Can I switch plans?', a: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and you'll be charged the prorated difference." },
  { q: 'Is my data secure?', a: 'Absolutely. Your CV data is encrypted and stored securely. We never share your personal information with third parties.' },
  { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee for all paid plans. Contact support if you are unsatisfied.' },
];

export default function Pricing() {
  const [plans, setPlans] = useState({ candidate: [], company: [] });
  const [currentSub, setCurrentSub] = useState(null);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [planType, setPlanType] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    subscriptionsAPI.getPlans().then((res) => setPlans(res.data.plans || { candidate: [], company: [] })).catch(() => {});
    subscriptionsAPI.getCurrent().then((res) => setCurrentSub(res.data.subscription)).catch(() => {});
  }, []);

  const handleSelect = async (plan) => {
    if (plan.price === 0) { navigate('/register'); return; }
    setLoading(true);
    try {
      const res = await subscriptionsAPI.createCheckout({ plan: plan.id, billing: billingAnnual ? 'annual' : 'monthly' });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else if (res.data.mock) {
        notifySuccess(`${plan.name} plan activated! (Demo mode)`);
        setCurrentSub(res.data.subscription);
      }
    } catch {
      notifyError('Failed to start checkout. Please try again.');
    }
    setLoading(false);
  };

  const displayedPlans = (plans[planType] || []).map((p) => ({
    ...p,
    price: billingAnnual ? (p.annual_price / 12).toFixed(2) : p.price,
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4F46E5 100%)', padding: '64px 24px 80px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '40px', fontWeight: 800 }}>Simple, Transparent Pricing</h1>
        <p style={{ margin: '0 auto', maxWidth: '540px', fontSize: '18px', opacity: 0.85 }}>
          Choose the plan that works best for you. Upgrade or cancel anytime.
        </p>

        {/* Plan type toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '4px', marginTop: '32px', width: 'fit-content', margin: '32px auto 0' }}>
          {['candidate', 'company'].map((t) => (
            <button key={t} onClick={() => setPlanType(t)} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: planType === t ? '#fff' : 'transparent', color: planType === t ? '#4F46E5' : '#fff', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontSize: '14px' }}>
              {t === 'candidate' ? '👤 Candidates' : '🏢 Companies'}
            </button>
          ))}
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <span style={{ fontSize: '14px', opacity: billingAnnual ? 0.6 : 1 }}>Monthly</span>
          <button
            onClick={() => setBillingAnnual((v) => !v)}
            style={{
              width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: billingAnnual ? '#10b981' : 'rgba(255,255,255,0.3)',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <span style={{ position: 'absolute', top: '2px', left: billingAnnual ? '22px' : '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
          </button>
          <span style={{ fontSize: '14px', opacity: billingAnnual ? 1 : 0.6 }}>
            Annual <span style={{ background: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>SAVE 20%</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: '1100px', margin: '-40px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {displayedPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentSub?.plan === plan.id && currentSub?.status === 'active'}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Feature comparison note */}
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '32px' }}>
          All plans include SSL security, GDPR compliance, and 99.9% uptime SLA.
          {loading && ' Processing...'}
        </p>

        {/* FAQ */}
        <div style={{ marginTop: '64px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '20px' }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>{item.q}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '48px', padding: '40px', background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', borderRadius: '16px', color: '#fff' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }}>Ready to build your perfect CV?</h3>
          <p style={{ margin: '0 0 20px', opacity: 0.85 }}>Join thousands of professionals who have already landed their dream jobs.</p>
          <button onClick={() => navigate('/register')} style={{ padding: '12px 32px', background: '#fff', color: '#4F46E5', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
