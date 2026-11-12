import Review from '../models/Review.js';
import Book from '../models/Book.js';

const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId });
  if (!reviews.length) {
    await Book.findByIdAndUpdate(bookId, { rating: 0, reviewCount: 0 });
    return;
  }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Book.findByIdAndUpdate(bookId, { rating: parseFloat(avg.toFixed(1)), reviewCount: reviews.length });
};

export const createReview = async (req, res, next) => {
  try {
    const { book, rating, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, book });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this book' });

    const review = await Review.create({ user: req.user._id, book, rating, comment });
    await updateBookRating(book);
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getBookReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const bookId = review.book;
    await review.deleteOne();
    await updateBookRating(bookId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
