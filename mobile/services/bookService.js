import api from './api';

export const bookService = {
  async getBooks(params = {}) {
    const res = await api.get('/books', { params });
    return res.data;
  },
  async getBook(id) {
    const res = await api.get(`/books/${id}`);
    return res.data;
  },
  async getFeatured() {
    const res = await api.get('/books/featured');
    return res.data;
  },
  async getNewArrivals() {
    const res = await api.get('/books/new-arrivals');
    return res.data;
  },
  async getBestSellers() {
    const res = await api.get('/books/best-sellers');
    return res.data;
  },
  async getGenres() {
    const res = await api.get('/books/genres');
    return res.data;
  },
  async getReviews(bookId) {
    const res = await api.get(`/reviews/book/${bookId}`);
    return res.data;
  },
  async createReview(bookId, rating, comment) {
    const res = await api.post('/reviews', { book: bookId, rating, comment });
    return res.data;
  },
};
