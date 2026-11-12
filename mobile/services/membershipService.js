import api from './api';

export const membershipService = {
  async getMyMembership() {
    const res = await api.get('/memberships/my');
    return res.data;
  },
  async subscribe(plan) {
    const res = await api.post('/memberships', { plan });
    return res.data;
  },
};
