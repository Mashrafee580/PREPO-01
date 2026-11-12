import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book', 'title coverUrl price stock');
    if (!cart) cart = { user: req.user._id, items: [] };
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { bookId, qty = 1 } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [{ book: bookId, qty, price: book.price }] });
    } else {
      const idx = cart.items.findIndex((i) => i.book.toString() === bookId);
      if (idx > -1) {
        const newQty = cart.items[idx].qty + qty;
        if (book.stock < newQty) return res.status(400).json({ success: false, message: 'Insufficient stock' });
        cart.items[idx].qty = newQty;
      } else {
        cart.items.push({ book: bookId, qty, price: book.price });
      }
      cart.updatedAt = new Date();
      await cart.save();
    }

    await cart.populate('items.book', 'title coverUrl price stock');
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { bookId, qty } = req.body;
    if (qty < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const idx = cart.items.findIndex((i) => i.book.toString() === bookId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    cart.items[idx].qty = qty;
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.book', 'title coverUrl price stock');
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.book', 'title coverUrl price stock');
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], updatedAt: new Date() });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
