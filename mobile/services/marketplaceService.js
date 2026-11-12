import api from './api';

export const marketplaceService = {
  async getListings(params = {}) {
    const res = await api.get('/marketplace', { params });
    return res.data;
  },
  async getListing(id) {
    const res = await api.get(`/marketplace/${id}`);
    return res.data;
  },
  async createListing(data) {
    const res = await api.post('/marketplace', data);
    return res.data;
  },
  async updateListing(id, data) {
    const res = await api.patch(`/marketplace/${id}`, data);
    return res.data;
  },
  async deleteListing(id) {
    const res = await api.delete(`/marketplace/${id}`);
    return res.data;
  },
  async contactSeller(id, data) {
    const res = await api.post(`/marketplace/${id}/contact`, data);
    return res.data;
  },
  async getMyListings() {
    const res = await api.get('/marketplace/my');
    return res.data;
  },
};
