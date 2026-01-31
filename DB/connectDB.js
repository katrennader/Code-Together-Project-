const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


async function connectDB() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected✅');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;

