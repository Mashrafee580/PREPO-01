#!/usr/bin/env node
require("dotenv").config();
const { pool } = require("./database");

async function promote(email) {
  if (!email) {
    console.error("Usage: node make-admin.js <email>");
    process.exit(1);
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, role FROM users WHERE email = ?",
      [email],
    );
    if (!rows.length) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }
    const user = rows[0];
    if (user.role === "admin") {
      console.log(`User ${email} is already an admin.`);
      process.exit(0);
    }

    await pool.execute("UPDATE users SET role = ? WHERE id = ?", [
      "admin",
      user.id,
    ]);
    console.log(`Success: Promoted ${email} to admin.`);
    process.exit(0);
  } catch (err) {
    console.error("Error promoting user:", err.message);
    process.exit(3);
  }
}

promote(process.argv[2]);
