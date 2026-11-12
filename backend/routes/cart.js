import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.patch('/update', protect, updateCartItem);
router.delete('/clear', protect, clearCart);
router.delete('/:bookId', protect, removeFromCart);

export default router;
