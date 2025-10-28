require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('../utils/seedData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockbeaver';

const runSeed = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      bufferCommands: false, // Disable mongoose buffering
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Run seed
    await seedData();
    
    console.log('🚀 Seed completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Seed failed:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

module.exports = runSeed;