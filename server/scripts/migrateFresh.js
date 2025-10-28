require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockbeaver';

const migrateFresh = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    console.log('🔄 Starting fresh migration...');
    
    // Get all collections
    const collections = mongoose.connection.collections;

    // Drop all collections
    console.log('🗑️  Dropping existing collections...');
    for (const key in collections) {
      console.log(`   Dropping collection: ${key}`);
      await collections[key].drop();
    }

    console.log('✅ All collections dropped');
    
    // Import and run seed after connection is established
    const seedData = require('../utils/seedData');
    await seedData({ clearExisting: false }); // Don't clear again since we dropped collections
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    throw error;
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  migrateFresh()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrateFresh;