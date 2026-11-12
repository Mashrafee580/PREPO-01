import { Router } from 'express';
import {
  getBooks, getBook, getFeatured, getNewArrivals, getBestSellers,
  createBook, updateBook, deleteBook, getGenres,
} from '../controllers/bookController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/:id', getBook);
router.post('/', protect, adminOnly, createBook);
router.patch('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

export default router;
