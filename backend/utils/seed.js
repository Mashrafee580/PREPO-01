import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Membership from '../models/Membership.js';
import MarketplaceListing from '../models/MarketplaceListing.js';

const books = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic', price: 14.99, originalPrice: 18.99, discount: 21, stock: 20, isFeatured: true, isBestSeller: true, coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg', description: 'Set in the Jazz Age on Long Island, a timeless story of wealth, love, and the American Dream.', rating: 4.5, reviewCount: 128 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Classic', price: 12.99, stock: 15, isFeatured: true, isNewArrival: false, coverUrl: 'https://covers.openlibrary.org/b/id/8091016-L.jpg', description: 'A gripping tale of racial injustice and childhood innocence in the American South.', rating: 4.8, reviewCount: 256 },
  { title: '1984', author: 'George Orwell', genre: 'Fiction', price: 11.49, originalPrice: 14.99, discount: 23, stock: 25, isFeatured: true, isBestSeller: true, coverUrl: 'https://covers.openlibrary.org/b/id/8235110-L.jpg', description: 'A chilling dystopia where Big Brother watches your every move.', rating: 4.7, reviewCount: 312 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance', price: 9.99, stock: 18, isNewArrival: true, coverUrl: 'https://covers.openlibrary.org/b/id/8228691-L.jpg', description: 'A witty story of love and social standing in 19th-century England.', rating: 4.6, reviewCount: 198 },
  { title: 'The Silent Patient', author: 'Alex Michaelides', genre: 'Thriller', price: 16.99, originalPrice: 21.99, discount: 23, stock: 12, isFeatured: true, isBestSeller: true, coverUrl: 'https://covers.openlibrary.org/b/id/8281993-L.jpg', description: 'A shocking psychological thriller with a twist you won\'t see coming.', rating: 4.4, reviewCount: 445 },
  { title: 'Where The Crawdads Sing', author: 'Delia Owens', genre: 'Mystery', price: 13.49, stock: 14, isNewArrival: true, coverUrl: 'https://covers.openlibrary.org/b/id/8250995-L.jpg', description: 'A beautiful story of nature, loneliness, and survival in the marshes.', rating: 4.5, reviewCount: 389 },
  { title: 'The Guest List', author: 'Lucy Foley', genre: 'Mystery', price: 15.99, stock: 10, isNewArrival: true, coverUrl: 'https://covers.openlibrary.org/b/id/8226193-L.jpg', description: 'A wedding on a remote island turns deadly. Everyone has a motive.', rating: 4.2, reviewCount: 167 },
  { title: 'The Midnight Library', author: 'Matt Haig', genre: 'Fiction', price: 12.99, originalPrice: 16.99, discount: 24, stock: 22, isFeatured: true, coverUrl: 'https://covers.openlibrary.org/b/id/8250634-L.jpg', description: 'Between life and death there is a library full of second chances.', rating: 4.6, reviewCount: 521 },
  { title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Science Fiction', price: 17.99, stock: 8, isBestSeller: true, coverUrl: 'https://covers.openlibrary.org/b/id/8255099-L.jpg', description: 'A solo mission to save Earth from an extinction-level threat.', rating: 4.9, reviewCount: 634 },
  { title: 'Atomic Habits', author: 'James Clear', genre: 'Self Development', price: 15.99, originalPrice: 19.99, discount: 20, stock: 30, isFeatured: true, isBestSeller: true, coverUrl: 'https://covers.openlibrary.org/b/id/10527843-L.jpg', description: 'Tiny changes, remarkable results. Build good habits, break bad ones.', rating: 4.8, reviewCount: 892 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', price: 14.99, stock: 20, isBestSeller: true, isNewArrival: false, coverUrl: 'https://covers.openlibrary.org/b/id/8303958-L.jpg', description: 'A brief history of humankind from ancient to modern times.', rating: 4.7, reviewCount: 743 },
  { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', price: 10.99, originalPrice: 13.99, discount: 21, stock: 25, isFeatured: true, coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg', description: 'A legendary tale about following your dreams and discovering your destiny.', rating: 4.5, reviewCount: 1024 },
  { title: 'Deep Work', author: 'Cal Newport', genre: 'Self Development', price: 13.99, stock: 16, isNewArrival: true, coverUrl: 'https://covers.openlibrary.org/b/id/9255009-L.jpg', description: 'Rules for focused success in a distracted world.', rating: 4.6, reviewCount: 388 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', genre: 'Business', price: 14.99, originalPrice: 18.99, discount: 21, stock: 19, isBestSeller: true, coverUrl: 'https://covers.openlibrary.org/b/id/10656856-L.jpg', description: 'Timeless lessons on wealth, greed, and happiness.', rating: 4.7, reviewCount: 567 },
  { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction', price: 16.49, stock: 11, isNewArrival: true, isFeatured: true, coverUrl: 'https://covers.openlibrary.org/b/id/8225261-L.jpg', description: 'The epic science fiction masterpiece set in a desert world of political intrigue.', rating: 4.8, reviewCount: 711 },
];

const run = async () => {
  await connectDB();
  console.log('\n🌱  Seeding database...\n');

  // Admin user
  let admin = await User.findOne({ email: 'admin@papertrail.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin User', email: 'admin@papertrail.com', password: 'admin123', role: 'admin', plan: 'ultimate' });
    await Membership.create({ user: admin._id, plan: 'ultimate', price: 19.99 });
    console.log('✓  Admin user created (admin@papertrail.com / admin123)');
  } else {
    console.log('⏭  Admin already exists');
  }

  // Test user
  let testUser = await User.findOne({ email: 'user@papertrail.com' });
  if (!testUser) {
    testUser = await User.create({ name: 'John Reader', email: 'user@papertrail.com', password: 'user123' });
    await Membership.create({ user: testUser._id, plan: 'free', price: 0 });
    console.log('✓  Test user created (user@papertrail.com / user123)');
  } else {
    console.log('⏭  Test user already exists');
  }

  // Books
  let bookCount = 0;
  for (const b of books) {
    const exists = await Book.findOne({ title: b.title });
    if (exists) { console.log(`⏭  Skipped: ${b.title}`); continue; }
    await Book.create(b);
    bookCount++;
    console.log(`✓  Book: ${b.title}`);
  }
  console.log(`\n  ${bookCount} books inserted.`);

  // Marketplace listings (approved)
  const allBooks = await Book.find().limit(5);
  let listCount = 0;
  const listings = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Classic', condition: 'Like New', price: 8.99, listingType: 'sell', description: 'Barely read, no markings.', coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg' },
    { title: '1984', author: 'George Orwell', category: 'Fiction', condition: 'Good', price: 6.50, listingType: 'sell', description: 'Some highlighting in first chapter.', coverUrl: 'https://covers.openlibrary.org/b/id/8235110-L.jpg' },
    { title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Thriller', condition: 'New', price: 14.00, listingType: 'sell', description: 'Bought as a gift, sealed.', coverUrl: 'https://covers.openlibrary.org/b/id/8281993-L.jpg' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', condition: 'Good', price: 7.00, listingType: 'buy', description: 'Need a copy for my book club.', coverUrl: 'https://covers.openlibrary.org/b/id/8228691-L.jpg' },
    { title: 'Project Hail Mary', author: 'Andy Weir', category: 'Science Fiction', condition: 'Like New', price: 12.00, listingType: 'sell', description: 'Read once, spine is perfect.', coverUrl: 'https://covers.openlibrary.org/b/id/8255099-L.jpg' },
  ];

  for (const l of listings) {
    const exists = await MarketplaceListing.findOne({ title: l.title, sellerName: 'John Reader' });
    if (exists) { console.log(`⏭  Skipped listing: ${l.title}`); continue; }
    await MarketplaceListing.create({ ...l, user: testUser._id, sellerName: 'John Reader', status: 'approved', reviewedBy: admin._id, reviewedAt: new Date() });
    listCount++;
    console.log(`✓  Listing: ${l.title}`);
  }
  console.log(`\n  ${listCount} listings inserted.`);

  console.log('\n✅  Seeding complete!\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
