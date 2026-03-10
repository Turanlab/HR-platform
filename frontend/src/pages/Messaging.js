import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MessageThread from '../components/MessageThread';
import useMessageStore from '../store/messageStore';
import { Toaster } from 'react-hot-toast';

export default function Messaging() {
  const location = useLocation();
  const [activeConversation, setActiveConversation] = useState(null);
  const { fetchConversations, conversations } = useMessageStore();

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If navigated here with a specific conversation or contact
    if (location.state?.conversationId) {
      setActiveConversation(location.state.conversationId);
    }
  }, [location.state]);

  return (
    <div style={{ height: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Toaster position="top-right" />
      {/* Page header */}
      <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>💬 Messages</h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Message thread takes rest of page */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 24px' }}>
        <div style={{ height: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <MessageThread
            conversationId={activeConversation}
            onConversationSelect={(id) => setActiveConversation(id)}
          />
        </div>
      </div>
    </div>
  );
}
