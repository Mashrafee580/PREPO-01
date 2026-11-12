import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import { createNotification } from '../utils/notifications.js';

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, shipping, delivery } = req.body;
    if (!items || !items.length) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify stock and build items array
    const orderItems = [];
    for (const item of items) {
      const book = await Book.findById(item.book).session(session);
      if (!book) throw new Error(`Book ${item.book} not found`);
      if (book.stock < item.qty) throw new Error(`Insufficient stock for "${book.title}"`);

      orderItems.push({
        book: book._id,
        title: book.title,
        price: book.price,
        qty: item.qty,
        coverUrl: book.coverUrl,
      });

      book.stock -= item.qty;
      await book.save({ session });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryCost = delivery?.cost ?? 3.99;
    const total = subtotal + deliveryCost;

    const [order] = await Order.create(
      [
        {
          user: req.user?._id || null,
          items: orderItems,
          shipping,
          delivery: { type: delivery?.type || 'standard', cost: deliveryCost },
          subtotal,
          total,
          paymentStatus: 'paid',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    if (req.user) {
      await createNotification(
        req.user._id,
        'Order Placed!',
        `Your order #${order.orderNumber} has been placed successfully.`,
        'order',
        { orderId: order._id }
      );
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.book', 'title coverUrl');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user) {
      const msgs = {
        confirmed: 'Your order has been confirmed and is being prepared.',
        shipped: 'Your order is on its way!',
        delivered: 'Your order has been delivered. Enjoy your books!',
        cancelled: 'Your order has been cancelled.',
      };
      if (msgs[status]) {
        await createNotification(order.user, 'Order Update', msgs[status], 'order', { orderId: order._id });
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
