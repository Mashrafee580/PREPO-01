/**
 * server.js — PaperTrail Express API (MySQL edition)
 *
 * Base URL: http://localhost:4000/api
 *
 * Auth         POST /api/auth/register
 *              POST /api/auth/login
 * Books        GET  /api/books          ?genre= &search=
 *              GET  /api/books/:id
 * Orders       POST /api/orders
 *              GET  /api/orders/:id
 * Marketplace  GET  /api/marketplace    ?type= &genre= &condition= &maxPrice= &search=
 *              POST /api/marketplace
 *              DELETE /api/marketplace/:id
 *              POST /api/marketplace/:id/contact
 * Membership   POST /api/membership     (JWT required)
 *              GET  /api/membership/:userId
 * Health       GET  /api/health
 */

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { pool, createSchema } = require("./database");

const app        = express();
const PORT       = process.env.PORT       || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "papertrail_secret_key";

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

const ok   = (res, data, status = 200)  => res.status(status).json({ success: true,  data });
const fail = (res, msg,  status = 400)  => res.status(status).json({ success: false, message: msg });

// JWT middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return fail(res, "No token provided", 401);
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    return fail(res, "Invalid or expired token", 401);
  }
}

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return fail(res, "Name, email and password are required");

  try {
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length) return fail(res, "Email already registered");

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash]
    );
    const userId = result.insertId;

    // Free membership record
    await pool.execute(
      "INSERT INTO memberships (user_id, plan, price) VALUES (?, 'free', 0)",
      [userId]
    );

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });
    return ok(res, { token, user: { id: userId, name, email, plan: "free" } }, 201);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, "Email and password required");

  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return fail(res, "Invalid email or password", 401);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return ok(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// ─────────────────────────────────────────────
//  BOOKS
// ─────────────────────────────────────────────

// GET /api/books?genre=Fiction&search=gatsby
app.get("/api/books", async (req, res) => {
  const { genre, search } = req.query;
  let sql    = "SELECT * FROM books WHERE 1=1";
  const params = [];

  if (genre)  { sql += " AND genre = ?";                          params.push(genre); }
  if (search) { sql += " AND (title LIKE ? OR author LIKE ?)";    params.push(`%${search}%`, `%${search}%`); }
  sql += " ORDER BY created_at DESC";

  try {
    const [rows] = await pool.execute(sql, params);
    return ok(res, rows);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// GET /api/books/:id
app.get("/api/books/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!rows.length) return fail(res, "Book not found", 404);
    return ok(res, rows[0]);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// ─────────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────────

// POST /api/orders
app.post("/api/orders", async (req, res) => {
  const { items, delivery, shipping } = req.body;
  if (!items || !items.length) return fail(res, "Cart is empty");
  if (!shipping?.name)         return fail(res, "Shipping details required");

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + (delivery?.cost || 3.99);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert order
    const [orderResult] = await conn.execute(
      `INSERT INTO orders
         (total, delivery_type, delivery_cost, name, email, phone, address, city, zip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        total,
        delivery?.type || "standard",
        delivery?.cost || 3.99,
        shipping.name, shipping.email, shipping.phone,
        shipping.address, shipping.city, shipping.zip
      ]
    );
    const orderId = orderResult.insertId;

    // Insert each line item and decrement stock
    for (const item of items) {
      await conn.execute(
        "INSERT INTO order_items (order_id, book_id, title, price, qty) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.bookId || 0, item.title, item.price, item.qty]
      );
      if (item.bookId) {
        await conn.execute(
          "UPDATE books SET stock = GREATEST(0, stock - ?) WHERE id = ?",
          [item.qty, item.bookId]
        );
      }
    }

    await conn.commit();
    return ok(res, { orderId, total }, 201);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return fail(res, "Could not place order", 500);
  } finally {
    conn.release();
  }
});

// GET /api/orders/:id
app.get("/api/orders/:id", async (req, res) => {
  try {
    const [orders] = await pool.execute("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!orders.length) return fail(res, "Order not found", 404);
    const [items] = await pool.execute("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    return ok(res, { ...orders[0], items });
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// ─────────────────────────────────────────────
//  MARKETPLACE
// ─────────────────────────────────────────────

// GET /api/marketplace
app.get("/api/marketplace", async (req, res) => {
  const { type, genre, condition, maxPrice, search } = req.query;
  let sql    = "SELECT * FROM marketplace_listings WHERE active = 1";
  const params = [];

  if (type)      { sql += " AND type = ?";                          params.push(type); }
  if (genre)     { sql += " AND genre = ?";                         params.push(genre); }
  if (condition) { sql += " AND `condition` = ?";                   params.push(condition); }
  if (maxPrice)  { sql += " AND price <= ?";                        params.push(parseFloat(maxPrice)); }
  if (search)    { sql += " AND (title LIKE ? OR author LIKE ?)";   params.push(`%${search}%`, `%${search}%`); }
  sql += " ORDER BY created_at DESC";

  try {
    const [rows] = await pool.execute(sql, params);
    return ok(res, rows);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// POST /api/marketplace
app.post("/api/marketplace", async (req, res) => {
  const { type, title, author, genre, condition, price, description, seller_name, cover_url } = req.body;
  if (!type || !title || !author || !seller_name || price == null)
    return fail(res, "type, title, author, seller_name and price are required");

  try {
    const [result] = await pool.execute(
      `INSERT INTO marketplace_listings
         (type, title, author, genre, \`condition\`, price, description, seller_name, cover_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, title, author, genre || "General", condition || "Good",
       parseFloat(price), description || "", seller_name, cover_url || ""]
    );
    const [rows] = await pool.execute(
      "SELECT * FROM marketplace_listings WHERE id = ?", [result.insertId]
    );
    return ok(res, rows[0], 201);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// DELETE /api/marketplace/:id  (soft delete)
app.delete("/api/marketplace/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id FROM marketplace_listings WHERE id = ?", [req.params.id]
    );
    if (!rows.length) return fail(res, "Listing not found", 404);
    await pool.execute("UPDATE marketplace_listings SET active = 0 WHERE id = ?", [req.params.id]);
    return ok(res, { message: "Listing removed" });
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// POST /api/marketplace/:id/contact
app.post("/api/marketplace/:id/contact", async (req, res) => {
  const { sender_name, sender_email, message } = req.body;
  if (!sender_name || !sender_email || !message)
    return fail(res, "sender_name, sender_email and message are required");

  try {
    const [rows] = await pool.execute(
      "SELECT id FROM marketplace_listings WHERE id = ? AND active = 1", [req.params.id]
    );
    if (!rows.length) return fail(res, "Listing not found", 404);

    await pool.execute(
      "INSERT INTO marketplace_messages (listing_id, sender_name, sender_email, message) VALUES (?, ?, ?, ?)",
      [req.params.id, sender_name, sender_email, message]
    );
    return ok(res, { message: "Message sent successfully" }, 201);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// ─────────────────────────────────────────────
//  MEMBERSHIP
// ─────────────────────────────────────────────

const PLAN_PRICES = { free: 0, premium: 9.99, ultimate: 19.99 };

// POST /api/membership  (JWT required)
app.post("/api/membership", auth, async (req, res) => {
  const { plan } = req.body;
  if (!["free", "premium", "ultimate"].includes(plan))
    return fail(res, "Invalid plan. Choose: free, premium or ultimate");

  try {
    await pool.execute("UPDATE memberships SET active = 0 WHERE user_id = ?", [req.user.id]);
    await pool.execute(
      "INSERT INTO memberships (user_id, plan, price) VALUES (?, ?, ?)",
      [req.user.id, plan, PLAN_PRICES[plan]]
    );
    await pool.execute("UPDATE users SET plan = ? WHERE id = ?", [plan, req.user.id]);
    return ok(res, { plan, price: PLAN_PRICES[plan], message: `Subscribed to ${plan} plan` });
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// GET /api/membership/:userId
app.get("/api/membership/:userId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM memberships WHERE user_id = ? AND active = 1 ORDER BY started_at DESC LIMIT 1",
      [req.params.userId]
    );
    if (!rows.length) return fail(res, "No active membership found", 404);
    return ok(res, rows[0]);
  } catch (err) {
    console.error(err);
    return fail(res, "Server error", 500);
  }
});

// ─────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────
app.get("/api/health", async (_, res) => {
  try {
    await pool.execute("SELECT 1");
    return ok(res, { status: "ok", db: "mysql", time: new Date().toISOString() });
  } catch {
    return fail(res, "Database unreachable", 503);
  }
});

// ─────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────
(async () => {
  try {
    await createSchema();
    app.listen(PORT, () => {
      console.log(`\n✅  PaperTrail API  →  http://localhost:${PORT}/api`);
      console.log(`   Health check    →  http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error("❌  Failed to connect to MySQL:", err.message);
    console.error("    Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env");
    process.exit(1);
  }
})();
