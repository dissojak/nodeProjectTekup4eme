const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const app = require('../app');

jest.setTimeout(60000);

beforeAll(async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}, 60000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error('MongoDB cleanup error:', err.message);
  }
}, 60000);

module.exports = app;
