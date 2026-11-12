import Membership from '../models/Membership.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notifications.js';

const PLAN_PRICES = { free: 0, premium: 9.99, ultimate: 19.99 };

export const subscribe = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['free', 'premium', 'ultimate'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const expiresAt = plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const membership = await Membership.findOneAndUpdate(
      { user: req.user._id },
      { plan, price: PLAN_PRICES[plan], status: 'active', startedAt: new Date(), expiresAt },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { plan });

    await createNotification(
      req.user._id,
      'Membership Updated',
      `You are now on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`,
      'membership',
      { plan }
    );

    res.json({ success: true, data: membership });
  } catch (err) {
    next(err);
  }
};

export const getMyMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id });
    if (!membership) return res.status(404).json({ success: false, message: 'No membership found' });
    res.json({ success: true, data: membership });
  } catch (err) {
    next(err);
  }
};
