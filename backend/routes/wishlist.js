import { Router } from 'express';
import { getMyWishlist, toggleWishlist, checkWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/my', protect, getMyWishlist);
router.post('/toggle', protect, toggleWishlist);
router.get('/check/:bookId', protect, checkWishlist);

export default router;
