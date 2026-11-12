import MarketplaceListing from '../models/MarketplaceListing.js';
import MarketplaceMessage from '../models/MarketplaceMessage.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notifications.js';

const IMPORTANT_FIELDS = ['title', 'author', 'price', 'condition', 'listingType'];

export const getListings = async (req, res, next) => {
  try {
    const { type, category, condition, maxPrice, search, sort, page = 1, limit = 20 } = req.query;
    const query = { status: 'approved', isActive: true };

    if (type) query.listingType = type;
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const total = await MarketplaceListing.countDocuments(query);
    const listings = await MarketplaceListing.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name avatar');

    res.json({
      success: true,
      data: listings,
      pagination: { total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) },
    });
  } catch (err) {
    next(err);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id).populate('user', 'name avatar email');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Allow owner or admin to see any status; public only sees approved
    const isOwner = req.user && listing.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (listing.status !== 'approved' && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.create({
      ...req.body,
      user: req.user._id,
      sellerName: req.user.name,
      status: 'pending',
    });

    // Notify all admins about new pending listing
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'New Listing Pending',
        `"${listing.title}" by ${listing.sellerName} requires review.`,
        'marketplace',
        { listingId: listing._id }
      );
    }

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const wasApproved = listing.status === 'approved';
    const changedImportant = IMPORTANT_FIELDS.some(
      (f) => req.body[f] !== undefined && String(req.body[f]) !== String(listing[f])
    );

    Object.assign(listing, req.body);
    if (wasApproved && changedImportant) {
      listing.status = 'pending';
      listing.rejectionReason = '';
    }
    await listing.save();
    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const isOwner = listing.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    listing.isActive = false;
    await listing.save();
    res.json({ success: true, message: 'Listing removed' });
  } catch (err) {
    next(err);
  }
};

export const contactSeller = async (req, res, next) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing || listing.status !== 'approved' || !listing.isActive) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const { senderName, senderEmail, message } = req.body;
    if (!senderName || !senderEmail || !message) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    await MarketplaceMessage.create({
      listing: listing._id,
      sender: req.user?._id || null,
      senderName,
      senderEmail,
      message,
    });

    await createNotification(
      listing.user,
      'New Message',
      `${senderName} sent a message about "${listing.title}".`,
      'marketplace',
      { listingId: listing._id }
    );

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const listings = await MarketplaceListing.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
};
