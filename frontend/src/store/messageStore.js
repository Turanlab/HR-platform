import { create } from 'zustand';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';

const useMessageStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const res = await messagesAPI.getConversations();
      set({
        conversations: res.data.conversations || [],
        unreadCount: res.data.unreadCount || 0,
        loading: false
      });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Failed to load conversations.' });
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    set({ loading: true });
    try {
      const res = await messagesAPI.getMessages(conversationId, { page });
      set({
        messages: res.data.messages || [],
        currentConversation: conversationId,
        loading: false
      });
      // Join socket room
      socketService.joinConversation(conversationId);
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Failed to load messages.' });
    }
  },

  sendMessage: async (receiverId, content) => {
    try {
      const res = await messagesAPI.send({ receiver_id: receiverId, content });
      const newMessage = res.data.message;
      set((state) => ({ messages: [...state.messages, newMessage] }));

      // Update conversation list
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === res.data.conversation_id
            ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
            : c
        )
      }));

      return { success: true, message: newMessage };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to send message.' };
    }
  },

  markRead: async (conversationId) => {
    try {
      await messagesAPI.markRead(conversationId);
      set((state) => ({
        messages: state.messages.map((m) => ({ ...m, is_read: true })),
        conversations: state.conversations.map((c) =>
          c.id === parseInt(conversationId) ? { ...c, unread_count: 0 } : c
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch {}
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id);
      if (exists) return {};
      return {
        messages: [...state.messages, message],
        unreadCount: state.unreadCount + 1
      };
    });
  },

  setCurrentConversation: (id) => {
    const prev = get().currentConversation;
    if (prev) socketService.leaveConversation(prev);
    set({ currentConversation: id, messages: [] });
  },

  clearError: () => set({ error: null }),
}));

export default useMessageStore;
