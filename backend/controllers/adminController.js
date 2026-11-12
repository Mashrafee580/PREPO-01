import User from '../models/User.js';
import Book from '../models/Book.js';
import Order from '../models/Order.js';
import MarketplaceListing from '../models/MarketplaceListing.js';
import MarketplaceMessage from '../models/MarketplaceMessage.js';
import Membership from '../models/Membership.js';
import { createNotification } from '../utils/notifications.js';

// ── Dashboard ──
export const getStats = async (req, res, next) => {
  try {
    const [users, books, orders, listings, pendingListings, paidMemberships] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Order.countDocuments(),
      MarketplaceListing.countDocuments({ status: 'approved', isActive: true }),
      MarketplaceListing.countDocuments({ status: 'pending', isActive: true }),
      Membership.countDocuments({ status: 'active', plan: { $ne: 'free' } }),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role plan createdAt');

    res.json({
      success: true,
      data: { users, books, orders, listings, pendingListings, paidMemberships, totalRevenue, recentOrders, recentUsers },
    });
  } catch (err) {
    next(err);
  }
};

// ── Users ──
export const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: users, pagination: { total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) } });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
    const listings = await MarketplaceListing.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: { user, orders, listings } });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Marketplace Approval ──
export const getPendingListings = async (req, res, next) => {
  try {
    const listings = await MarketplaceListing.find({ status: 'pending', isActive: true })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
};

export const getAllListingsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await MarketplaceListing.countDocuments(query);
    const listings = await MarketplaceListing.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    res.json({ success: true, data: listings, pagination: { total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) } });
  } catch (err) {
    next(err);
  }
};

export const approveListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', reviewedBy: req.user._id, reviewedAt: new Date(), rejectionReason: '' },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    await createNotification(
      listing.user,
      'Listing Approved!',
      `Your listing "${listing.title}" has been approved and is now live.`,
      'marketplace',
      { listingId: listing._id }
    );

    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

export const rejectListing = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', reviewedBy: req.user._id, reviewedAt: new Date(), rejectionReason: reason || '' },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    await createNotification(
      listing.user,
      'Listing Rejected',
      `Your listing "${listing.title}" was rejected. Reason: ${reason || 'No reason provided'}. You can edit and resubmit.`,
      'marketplace',
      { listingId: listing._id }
    );

    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

export const hardDeleteListing = async (req, res, next) => {
  try {
    await MarketplaceListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Orders ──
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    res.json({ success: true, data: orders, pagination: { total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) } });
  } catch (err) {
    next(err);
  }
};

// ── Memberships ──
export const getAllMemberships = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ status: 'active' })
      .sort({ startedAt: -1 })
      .populate('user', 'name email');
    res.json({ success: true, data: memberships });
  } catch (err) {
    next(err);
  }
};

// ── Messages ──
export const getAllMessages = async (req, res, next) => {
  try {
    const messages = await MarketplaceMessage.find()
      .sort({ createdAt: -1 })
      .populate('listing', 'title')
      .limit(100);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};
