import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('pt_token');
      const userStr = await AsyncStorage.getItem('pt_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch {}
    set({ isLoading: false });
  },

  login: async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      await AsyncStorage.setItem('pt_token', res.data.token);
      await AsyncStorage.setItem('pt_user', JSON.stringify(res.data.user));
      set({ token: res.data.token, user: res.data.user, isAuthenticated: true });
    }
    return res;
  },

  register: async (name, email, password) => {
    const res = await authService.register(name, email, password);
    if (res.success) {
      await AsyncStorage.setItem('pt_token', res.data.token);
      await AsyncStorage.setItem('pt_user', JSON.stringify(res.data.user));
      set({ token: res.data.token, user: res.data.user, isAuthenticated: true });
    }
    return res;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success) {
      await AsyncStorage.setItem('pt_user', JSON.stringify(res.data));
      set({ user: res.data });
    }
    return res;
  },

  refreshUser: async () => {
    try {
      const res = await authService.getMe();
      if (res.success) {
        await AsyncStorage.setItem('pt_user', JSON.stringify(res.data));
        set({ user: res.data });
      }
    } catch {}
  },
}));
