const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const app = require('../app');

jest.setTimeout(90000);

let connectionAttempted = false;

beforeAll(async () => {
  try {
    if (!connectionAttempted) {
      connectionAttempted = true;
      console.log('Attempting MongoDB connection...');
      
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 60000,
          connectTimeoutMS: 10000,
          retryWrites: true,
        });
        console.log('✓ MongoDB connected successfully');
      }
    }
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Make sure:');
    console.error('1. MongoDB URI is correct in .env.test');
    console.error('2. Your IP address is whitelisted in MongoDB Atlas');
    console.error('3. MongoDB service is running');
    throw err;
  }
}, 90000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      await mongoose.connection.close();
      console.log('✓ MongoDB cleaned up and closed');
    }
  } catch (err) {
    console.error('⚠️  MongoDB cleanup error:', err.message);
  }
}, 90000);

module.exports = app;
