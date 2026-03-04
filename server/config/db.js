const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat_db';

async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('[MongoDB] Connected to', MONGO_URI);
}

module.exports = connectDB;
