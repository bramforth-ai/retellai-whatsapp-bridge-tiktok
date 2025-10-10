const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DATABASE_NAME;

    if (!mongoUri || !dbName) {
      throw new Error('MongoDB URI or Database Name missing in environment variables');
    }

    await mongoose.connect(mongoUri, {
      dbName: dbName
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${dbName}`);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

module.exports = connectDB;