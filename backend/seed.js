/**
 * seed.js — Inserts sample books and marketplace listings into MySQL.
 * Run once after the server has created the schema:
 *   node seed.js
 */

require("dotenv").config();
const { pool, createSchema } = require("./database");

const books = [
  { title: "The Great Gatsby",        author: "F. Scott Fitzgerald", genre: "Classic",         price: 14.99, stock: 20, cover_url: "https://covers.openlibrary.org/b/id/8231856-L.jpg", description: "Set in the Jazz Age on Long Island, a timeless story of wealth, love, and the American Dream." },
  { title: "To Kill a Mockingbird",   author: "Harper Lee",          genre: "Classic",         price: 12.99, stock: 15, cover_url: "https://covers.openlibrary.org/b/id/8091016-L.jpg", description: "A gripping tale of racial injustice and childhood innocence in the American South." },
  { title: "1984",                    author: "George Orwell",       genre: "Fiction",         price: 11.49, stock: 25, cover_url: "https://covers.openlibrary.org/b/id/8235110-L.jpg", description: "A chilling dystopia where Big Brother watches your every move." },
  { title: "Pride and Prejudice",     author: "Jane Austen",         genre: "Romance",         price: 9.99,  stock: 18, cover_url: "https://covers.openlibrary.org/b/id/8228691-L.jpg", description: "A witty story of love and social standing in 19th-century England." },
  { title: "The Silent Patient",      author: "Alex Michaelides",    genre: "Thriller",        price: 16.99, stock: 12, cover_url: "https://covers.openlibrary.org/b/id/8281993-L.jpg", description: "A shocking psychological thriller with a twist you won't see coming." },
  { title: "Where The Crawdads Sing", author: "Delia Owens",         genre: "Mystery",         price: 13.49, stock: 14, cover_url: "https://covers.openlibrary.org/b/id/8250995-L.jpg", description: "A beautiful story of nature, loneliness, and survival in the marshes." },
  { title: "The Guest List",          author: "Lucy Foley",          genre: "Mystery",         price: 15.99, stock: 10, cover_url: "https://covers.openlibrary.org/b/id/8226193-L.jpg", description: "A wedding on a remote island turns deadly. Everyone has a motive." },
  { title: "The Midnight Library",    author: "Matt Haig",           genre: "Fiction",         price: 12.99, stock: 22, cover_url: "https://covers.openlibrary.org/b/id/8250634-L.jpg", description: "Between life and death there is a library full of second chances." },
  { title: "Project Hail Mary",       author: "Andy Weir",           genre: "Science Fiction", price: 17.99, stock: 8,  cover_url: "https://covers.openlibrary.org/b/id/8255099-L.jpg", description: "A solo mission to save Earth from an extinction-level threat." },
];

const listings = [
  { type: "sell", title: "The Great Gatsby",        author: "F. Scott Fitzgerald", genre: "Classic",         condition: "Like New", price: 8.99,  description: "Barely read, no markings. Paperback edition.",        seller_name: "BookLover92",  cover_url: "https://covers.openlibrary.org/b/id/8231856-L.jpg" },
  { type: "sell", title: "1984",                    author: "George Orwell",       genre: "Fiction",         condition: "Good",     price: 6.50,  description: "Some highlighting in first chapter, otherwise clean.", seller_name: "ReadMore_BD",  cover_url: "https://covers.openlibrary.org/b/id/8235110-L.jpg" },
  { type: "buy",  title: "To Kill a Mockingbird",   author: "Harper Lee",          genre: "Classic",         condition: "Any",      price: 10.00, description: "Looking for any edition in good or better condition.", seller_name: "Nadia_Reads",  cover_url: "https://covers.openlibrary.org/b/id/8091016-L.jpg" },
  { type: "sell", title: "The Silent Patient",      author: "Alex Michaelides",    genre: "Thriller",        condition: "New",      price: 14.00, description: "Bought as a gift but already had a copy. Sealed.",     seller_name: "Arif_Books",   cover_url: "https://covers.openlibrary.org/b/id/8281993-L.jpg" },
  { type: "sell", title: "Project Hail Mary",       author: "Andy Weir",           genre: "Science Fiction", condition: "Like New", price: 12.00, description: "Read once, spine is perfect.",                        seller_name: "SciFiSam",     cover_url: "https://covers.openlibrary.org/b/id/8255099-L.jpg" },
  { type: "buy",  title: "Pride and Prejudice",     author: "Jane Austen",         genre: "Romance",         condition: "Good",     price: 7.00,  description: "Need a copy for my book club. Any edition welcome.",   seller_name: "Mitu_Dhaka",   cover_url: "https://covers.openlibrary.org/b/id/8228691-L.jpg" },
  { type: "sell", title: "The Midnight Library",    author: "Matt Haig",           genre: "Fiction",         condition: "Good",     price: 9.00,  description: "A few dog-eared pages but text is clean.",             seller_name: "PageTurner99", cover_url: "https://covers.openlibrary.org/b/id/8250634-L.jpg" },
  { type: "sell", title: "Where The Crawdads Sing", author: "Delia Owens",         genre: "Mystery",         condition: "Like New", price: 11.50, description: "Read once carefully. No marks, no damage.",            seller_name: "Riya_Reads",   cover_url: "https://covers.openlibrary.org/b/id/8250995-L.jpg" },
];

(async () => {
  try {
    // Make sure tables exist first
    await createSchema();

    console.log("\n🌱  Seeding MySQL database...\n");

    // ── Books ──
    let bookCount = 0;
    for (const b of books) {
      // Skip if title already exists (idempotent)
      const [exists] = await pool.execute("SELECT id FROM books WHERE title = ?", [b.title]);
      if (exists.length) { console.log(`  ⏭  Skipped (exists): ${b.title}`); continue; }

      await pool.execute(
        `INSERT INTO books (title, author, genre, price, stock, cover_url, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.title, b.author, b.genre, b.price, b.stock, b.cover_url, b.description]
      );
      bookCount++;
      console.log(`  ✓  Book: ${b.title}`);
    }
    console.log(`\n  ${bookCount} books inserted.\n`);

    // ── Marketplace listings ──
    let listCount = 0;
    for (const l of listings) {
      const [exists] = await pool.execute(
        "SELECT id FROM marketplace_listings WHERE title = ? AND seller_name = ?",
        [l.title, l.seller_name]
      );
      if (exists.length) { console.log(`  ⏭  Skipped (exists): ${l.title} by ${l.seller_name}`); continue; }

      await pool.execute(
        `INSERT INTO marketplace_listings
           (type, title, author, genre, \`condition\`, price, description, seller_name, cover_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [l.type, l.title, l.author, l.genre, l.condition, l.price, l.description, l.seller_name, l.cover_url]
      );
      listCount++;
      console.log(`  ✓  Listing [${l.type}]: ${l.title}`);
    }
    console.log(`\n  ${listCount} listings inserted.`);

    console.log("\n✅  Seeding complete!\n");
  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    console.error("    Make sure MySQL is running and .env credentials are correct.\n");
  } finally {
    process.exit(0);
  }
})();
