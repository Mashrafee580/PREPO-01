import { Router } from 'express';
import {
  getStats, getUsers, getUser, updateUserRole, toggleBlockUser, deleteUser,
  getPendingListings, getAllListingsAdmin, approveListing, rejectListing, hardDeleteListing,
  getAllOrders, getAllMemberships, getAllMessages,
} from '../controllers/adminController.js';
import { updateOrderStatus } from '../controllers/orderController.js';
import { createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/marketplace/pending', getPendingListings);
router.get('/marketplace', getAllListingsAdmin);
router.patch('/marketplace/:id/approve', approveListing);
router.patch('/marketplace/:id/reject', rejectListing);
router.delete('/marketplace/:id', hardDeleteListing);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.post('/books', createBook);
router.patch('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

router.get('/memberships', getAllMemberships);
router.get('/messages', getAllMessages);

export default router;
