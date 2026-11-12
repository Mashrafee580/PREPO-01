import { Router } from 'express';
import { register, login, getMe, changePassword, updateProfile, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);
router.patch('/profile', protect, updateProfile);

export default router;
