/**
 * database.js
 * Creates a mysql2 connection pool and exports it.
 * All queries use pool.execute() which auto-prepares statements
 * and returns promises — no callbacks needed.
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  database:           process.env.DB_NAME     || "papertrail",
  waitForConnections: true,
  connectionLimit:    10,       // max simultaneous connections
  queueLimit:         0,
  timezone:           "Z",      // store/read dates as UTC
});

/**
 * createSchema()
 * Runs once at startup to create all tables if they don't exist.
 * Safe to call every time — uses IF NOT EXISTS.
 */
async function createSchema() {
  const conn = await pool.getConnection();
  try {
    // Users
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT          AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(120) NOT NULL,
        email      VARCHAR(180) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        plan       ENUM('free','premium','ultimate') NOT NULL DEFAULT 'free',
        created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Books catalog
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id          INT           AUTO_INCREMENT PRIMARY KEY,
        title       VARCHAR(255)  NOT NULL,
        author      VARCHAR(180)  NOT NULL,
        genre       VARCHAR(80)   NOT NULL DEFAULT 'General',
        price       DECIMAL(8,2)  NOT NULL,
        cover_url   TEXT,
        description TEXT,
        stock       INT           NOT NULL DEFAULT 10,
        created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Orders
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id            INT           AUTO_INCREMENT PRIMARY KEY,
        user_id       INT           DEFAULT NULL,
        total         DECIMAL(10,2) NOT NULL,
        delivery_type VARCHAR(40)   NOT NULL DEFAULT 'standard',
        delivery_cost DECIMAL(6,2)  NOT NULL DEFAULT 3.99,
        status        ENUM('pending','confirmed','shipped','delivered') NOT NULL DEFAULT 'pending',
        name          VARCHAR(120)  NOT NULL,
        email         VARCHAR(180)  NOT NULL,
        phone         VARCHAR(30)   NOT NULL,
        address       VARCHAR(255)  NOT NULL,
        city          VARCHAR(100)  NOT NULL,
        zip           VARCHAR(20)   NOT NULL,
        created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Order line items
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id       INT           AUTO_INCREMENT PRIMARY KEY,
        order_id INT           NOT NULL,
        book_id  INT           NOT NULL DEFAULT 0,
        title    VARCHAR(255)  NOT NULL,
        price    DECIMAL(8,2)  NOT NULL,
        qty      INT           NOT NULL DEFAULT 1,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Marketplace listings
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id          INT           AUTO_INCREMENT PRIMARY KEY,
        user_id     INT           DEFAULT NULL,
        type        ENUM('sell','buy') NOT NULL,
        title       VARCHAR(255)  NOT NULL,
        author      VARCHAR(180)  NOT NULL,
        genre       VARCHAR(80)   NOT NULL DEFAULT 'General',
        \`condition\` VARCHAR(40)   NOT NULL DEFAULT 'Good',
        price       DECIMAL(8,2)  NOT NULL,
        description TEXT,
        seller_name VARCHAR(120)  NOT NULL,
        cover_url   TEXT,
        active      TINYINT(1)    NOT NULL DEFAULT 1,
        created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Marketplace contact messages
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS marketplace_messages (
        id           INT          AUTO_INCREMENT PRIMARY KEY,
        listing_id   INT          NOT NULL,
        sender_name  VARCHAR(120) NOT NULL,
        sender_email VARCHAR(180) NOT NULL,
        message      TEXT         NOT NULL,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Membership subscriptions
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS memberships (
        id         INT           AUTO_INCREMENT PRIMARY KEY,
        user_id    INT           NOT NULL,
        plan       ENUM('free','premium','ultimate') NOT NULL,
        price      DECIMAL(6,2)  NOT NULL DEFAULT 0.00,
        started_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        active     TINYINT(1)    NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅  MySQL schema ready");
  } finally {
    conn.release();
  }
}

module.exports = { pool, createSchema };
