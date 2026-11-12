import { Router } from 'express';
import {
  getListings, getListing, createListing, updateListing,
  deleteListing, contactSeller, getMyListings,
} from '../controllers/marketplaceController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getListings);
router.get('/my', protect, getMyListings);
router.get('/:id', optionalAuth, getListing);
router.post('/', protect, createListing);
router.patch('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/contact', optionalAuth, contactSeller);

export default router;
