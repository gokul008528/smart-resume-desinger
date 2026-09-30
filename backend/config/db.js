const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI is not set. Set it in server/.env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
