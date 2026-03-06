import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionBadge from '../components/SubscriptionBadge';
import { subscriptionsAPI, cvBuilderAPI } from '../services/api';
import { notifySuccess, notifyError } from '../components/Notification';
import useAuthStore from '../store/authStore';
import { Toaster } from 'react-hot-toast';

function FormField({ label, value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', background: disabled ? '#f9fafb' : '#fff', boxSizing: 'border-box', color: disabled ? '#9ca3af' : '#1f2937' }}
      />
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({ full_name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [subscription, setSubscription] = useState(null);
  const [cvList, setCvList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) setProfileData({ full_name: user.full_name || '', email: user.email || '' });
    subscriptionsAPI.getCurrent().then((res) => setSubscription(res.data.subscription)).catch(() => {});
    cvBuilderAPI.list({ limit: 10 }).then((res) => setCvList(res.data.cvs || [])).catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In a real app we'd call a profile update endpoint; for now just update local state
      setUser({ ...user, ...profileData });
      notifySuccess('Profile updated successfully!');
    } catch {
      notifyError('Failed to update profile.');
    }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      notifyError('New passwords do not match.');
      return;
    }
    notifySuccess('Password changed successfully! (Demo)');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const TABS = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'cvs', label: '📄 My CVs' },
    { id: 'subscription', label: '⭐ Subscription' },
    { id: 'password', label: '🔒 Security' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <Toaster position="top-right" />
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: '26px', fontWeight: 700, color: '#1f2937' }}>Account Settings</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e5e7eb', marginBottom: '24px' }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? '#4F46E5' : '#6b7280', borderBottom: activeTab === tab.id ? '2px solid #4F46E5' : '2px solid transparent', marginBottom: '-2px' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 600, color: '#1f2937' }}>Personal Information</h2>
              <FormField label="Full Name" value={profileData.full_name} onChange={(e) => setProfileData((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
              <FormField label="Email Address" value={profileData.email} onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="your@email.com" />
              <FormField label="Role" value={user?.role || ''} disabled />
              <FormField label="Member Since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} disabled />
              <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* CVs tab */}
          {activeTab === 'cvs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#1f2937' }}>My CVs</h2>
                <button onClick={() => navigate('/cv-builder')} style={{ padding: '8px 16px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                  + Create New CV
                </button>
              </div>
              {cvList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <p>No CVs yet. <button onClick={() => navigate('/cv-builder')} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontWeight: 500 }}>Build your first CV</button></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cvList.map((cv) => (
                    <div key={cv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{cv.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                          {cv.template_name && `Template: ${cv.template_name} · `}ATS Score: {cv.ats_score || 0}% · Updated: {new Date(cv.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/cv-builder?id=${cv.id}`)} style={{ padding: '6px 12px', background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscription tab */}
          {activeTab === 'subscription' && (
            <div>
              <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 600, color: '#1f2937' }}>Subscription</h2>
              <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Current Plan</span>
                  <SubscriptionBadge tier={subscription?.plan || 'free'} onUpgrade={() => navigate('/pricing')} />
                </div>
                {subscription && subscription.plan !== 'free' && (
                  <>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Status: <strong style={{ color: subscription.status === 'active' ? '#10b981' : '#ef4444' }}>{subscription.status}</strong></div>
                    {subscription.current_period_end && (
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>Renews: {new Date(subscription.current_period_end).toLocaleDateString()}</div>
                    )}
                  </>
                )}
              </div>
              {(!subscription || subscription.plan === 'free') && (
                <button onClick={() => navigate('/pricing')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Upgrade to Premium →
                </button>
              )}
            </div>
          )}

          {/* Password tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword}>
              <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 600, color: '#1f2937' }}>Change Password</h2>
              <FormField label="Current Password" value={passwordData.current} onChange={(e) => setPasswordData((p) => ({ ...p, current: e.target.value }))} type="password" placeholder="Enter current password" />
              <FormField label="New Password" value={passwordData.new} onChange={(e) => setPasswordData((p) => ({ ...p, new: e.target.value }))} type="password" placeholder="Enter new password" />
              <FormField label="Confirm New Password" value={passwordData.confirm} onChange={(e) => setPasswordData((p) => ({ ...p, confirm: e.target.value }))} type="password" placeholder="Confirm new password" />
              <button type="submit" style={{ padding: '10px 24px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                Change Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
