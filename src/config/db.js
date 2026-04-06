const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connection caching for serverless environments (Vercel)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('MongoDB connected...');
};

module.exports = connectDB;

