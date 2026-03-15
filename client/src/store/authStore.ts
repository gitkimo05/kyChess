import { create } from 'zustand';
import type { User } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await api.login(username, password);
      set({ user, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await api.register(username, email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    socketService.disconnect();
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = api.getToken();
    if (!token) { set({ isLoading: false }); return; }
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      socketService.connect();
    } catch {
      api.logout();
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));