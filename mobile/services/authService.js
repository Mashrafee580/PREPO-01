import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
  async updateProfile(data) {
    const res = await api.patch('/auth/profile', data);
    return res.data;
  },
  async changePassword(currentPassword, newPassword) {
    const res = await api.patch('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
  async logout() {
    await AsyncStorage.multiRemove(['pt_token', 'pt_user']);
  },
};
