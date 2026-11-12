import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌  MONGODB_URI is not set in .env');
    console.error('    Set it to mongodb://localhost:27017/papertrail  (local)');
    console.error('    or  mongodb+srv://user:pass@cluster.mongodb.net/papertrail  (Atlas)');
    process.exit(1);
  }

  const options = {
    // Prevents Mongoose 7+ deprecation warnings
    serverSelectionTimeoutMS: 10000,  // fail fast — 10 s instead of 30 s
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection error: ${err.message}`);

    if (err.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('  MongoDB is not running or not reachable at:');
      console.error(`  ${uri}`);
      console.error('');
      console.error('  Options:');
      console.error('  1. Start MongoDB locally:');
      console.error('       net start MongoDB          (Windows service)');
      console.error('       mongod --dbpath C:\\data\\db  (manual start)');
      console.error('');
      console.error('  2. Use MongoDB Atlas (free tier):');
      console.error('       https://www.mongodb.com/atlas/database');
      console.error('       Then set MONGODB_URI in backend/.env to your Atlas connection string');
      console.error('');
      console.error('  3. Use Docker:');
      console.error('       docker run -d -p 27017:27017 --name mongo mongo:7');
    }

    process.exit(1);
  }
};

export default connectDB;
