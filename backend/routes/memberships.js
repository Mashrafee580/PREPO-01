import { Router } from 'express';
import { subscribe, getMyMembership } from '../controllers/membershipController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/my', protect, getMyMembership);
router.post('/', protect, subscribe);

export default router;
