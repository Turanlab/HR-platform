import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

let socket = null;

const socketService = {
  connect(token) {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket() {
    return socket;
  },

  isConnected() {
    return socket?.connected ?? false;
  },

  joinConversation(conversationId) {
    if (socket?.connected) {
      socket.emit('join_conversation', conversationId);
    }
  },

  leaveConversation(conversationId) {
    if (socket?.connected) {
      socket.emit('leave_conversation', conversationId);
    }
  },

  sendMessage(data) {
    if (socket?.connected) {
      socket.emit('send_message', data);
    }
  },

  onMessage(callback) {
    socket?.on('new_message', callback);
    return () => socket?.off('new_message', callback);
  },

  onMessageRead(callback) {
    socket?.on('message_read', callback);
    return () => socket?.off('message_read', callback);
  },

  onNotification(callback) {
    socket?.on('notification', callback);
    return () => socket?.off('notification', callback);
  },

  onUserOnline(callback) {
    socket?.on('user_online', callback);
    return () => socket?.off('user_online', callback);
  },

  onUserOffline(callback) {
    socket?.on('user_offline', callback);
    return () => socket?.off('user_offline', callback);
  },

  off(event, callback) {
    socket?.off(event, callback);
  }
};

export default socketService;
