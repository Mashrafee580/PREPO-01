import api from './api';

export const orderService = {
  async createOrder(items, shipping, delivery) {
    const res = await api.post('/orders', { items, shipping, delivery });
    return res.data;
  },
  async getOrder(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  async getMyOrders() {
    const res = await api.get('/orders/my');
    return res.data;
  },
};
