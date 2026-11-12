/**
 * checkDb.js — Run with: node utils/checkDb.js
 * Tests the MongoDB connection and prints a clear success/failure message.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
console.log(`\n🔍  Testing MongoDB connection...`);
console.log(`    URI: ${uri}\n`);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`✅  Connected to MongoDB at: ${mongoose.connection.host}`);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error(`❌  Connection failed: ${err.message}\n`);
  console.error('  Fix options:');
  console.error('  1. MongoDB Atlas  →  update MONGODB_URI in backend/.env with your Atlas connection string');
  console.error('  2. Local MongoDB  →  install & start MongoDB Community Server');
  console.error('  3. Docker         →  docker run -d -p 27017:27017 --name mongo mongo:7\n');
  process.exit(1);
}
