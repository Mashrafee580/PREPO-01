import Wishlist from '../models/Wishlist.js';

export const getMyWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('books', 'title author price coverUrl rating');
    res.json({ success: true, data: wishlist || { books: [] } });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [bookId] });
      return res.json({ success: true, added: true, data: wishlist });
    }

    const idx = wishlist.books.findIndex((b) => b.toString() === bookId);
    if (idx > -1) {
      wishlist.books.splice(idx, 1);
    } else {
      wishlist.books.push(bookId);
    }
    wishlist.updatedAt = new Date();
    await wishlist.save();
    res.json({ success: true, added: idx === -1, data: wishlist });
  } catch (err) {
    next(err);
  }
};

export const checkWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const inWishlist = wishlist?.books.some((b) => b.toString() === req.params.bookId) || false;
    res.json({ success: true, inWishlist });
  } catch (err) {
    next(err);
  }
};
