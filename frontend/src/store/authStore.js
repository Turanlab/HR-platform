import { create } from 'zustand';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      socketService.connect(token);
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed.';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      socketService.connect(token);
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed.';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    socketService.disconnect();
    set({ user: null, token: null, error: null });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    set({ loading: true });
    try {
      const res = await authAPI.me();
      set({ user: res.data.user, loading: false });
      socketService.connect(token);
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
