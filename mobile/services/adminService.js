import api from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
  async updateUserRole(id, role) {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },
  async toggleBlockUser(id) {
    const res = await api.patch(`/admin/users/${id}/block`);
    return res.data;
  },
  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
  async getPendingListings() {
    const res = await api.get('/admin/marketplace/pending');
    return res.data;
  },
  async getAllListings(params = {}) {
    const res = await api.get('/admin/marketplace', { params });
    return res.data;
  },
  async approveListing(id) {
    const res = await api.patch(`/admin/marketplace/${id}/approve`);
    return res.data;
  },
  async rejectListing(id, reason) {
    const res = await api.patch(`/admin/marketplace/${id}/reject`, { reason });
    return res.data;
  },
  async deleteListing(id) {
    const res = await api.delete(`/admin/marketplace/${id}`);
    return res.data;
  },
  async getAllOrders(params = {}) {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },
  async updateOrderStatus(id, status) {
    const res = await api.patch(`/admin/orders/${id}/status`, { status });
    return res.data;
  },
  async createBook(data) {
    const res = await api.post('/admin/books', data);
    return res.data;
  },
  async updateBook(id, data) {
    const res = await api.patch(`/admin/books/${id}`, data);
    return res.data;
  },
  async deleteBook(id) {
    const res = await api.delete(`/admin/books/${id}`);
    return res.data;
  },
  async getMemberships() {
    const res = await api.get('/admin/memberships');
    return res.data;
  },
  async getMessages() {
    const res = await api.get('/admin/messages');
    return res.data;
  },
};
