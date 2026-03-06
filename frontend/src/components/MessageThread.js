import React, { useState, useEffect, useRef } from 'react';
import useMessageStore from '../store/messageStore';
import useAuthStore from '../store/authStore';
import socketService from '../services/socket';

function MessageThread({ conversationId, onConversationSelect }) {
  const { conversations, messages, unreadCount, fetchConversations, fetchMessages, sendMessage, markRead, addMessage } = useMessageStore();
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markRead(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const cleanup = socketService.onMessage((data) => {
      if (data.message) addMessage(data.message);
    });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || sending) return;

    const conv = conversations.find((c) => c.id === parseInt(conversationId));
    if (!conv) return;

    const receiverId = conv.participant1_id === user?.id ? conv.participant2_id : conv.participant1_id;
    setSending(true);
    await sendMessage(receiverId, inputText.trim());
    setInputText('');
    setSending(false);
  };

  const getOtherParticipant = (conv) => {
    if (!user) return { name: 'Unknown', email: '' };
    if (conv.participant1_id === user.id) {
      return { name: conv.p2_name || conv.p2_email, email: conv.p2_email, avatar: conv.p2_avatar };
    }
    return { name: conv.p1_name || conv.p1_email, email: conv.p1_email, avatar: conv.p1_avatar };
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      {/* Conversations sidebar */}
      <div style={{ width: '280px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: '15px', color: '#1f2937' }}>
          Messages {unreadCount > 0 && <span style={{ background: '#4F46E5', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '12px', marginLeft: '6px' }}>{unreadCount}</span>}
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No conversations yet</div>
          )}
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = conv.id === parseInt(conversationId);
            return (
              <div
                key={conv.id}
                onClick={() => onConversationSelect && onConversationSelect(conv.id)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: isActive ? '#ede9fe' : 'transparent',
                  borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                    {(other.name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.name}</div>
                    {conv.last_message && (
                      <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message}</div>
                    )}
                  </div>
                  {parseInt(conv.unread_count) > 0 && (
                    <span style={{ background: '#4F46E5', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>{conv.unread_count}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!conversationId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '15px' }}>
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '65%',
                        padding: '10px 14px',
                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMine ? '#4F46E5' : '#f3f4f6',
                        color: isMine ? '#fff' : '#1f2937',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <span style={{ marginLeft: '4px' }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '24px', fontSize: '14px', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                style={{ padding: '10px 20px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: !inputText.trim() || sending ? 0.6 : 1 }}
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default MessageThread;
