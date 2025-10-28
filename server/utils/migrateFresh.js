const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const seedData = require('./seedData');

const migrateFresh = async () => {
  try {
    console.log('🔄 Starting fresh migration...');
    
    // Get all collections
    const collections = mongoose.connection.collections;

    // Drop all collections
    console.log('🗑️  Dropping existing collections...');
    for (const key in collections) {
      await collections[key].deleteMany();
    }

    // Recreate indexes (optional, but good practice)
    console.log('📊 Recreating indexes...');
    await Stock.createIndexes();
    await User.createIndexes();
    await Trade.createIndexes();
    await Portfolio.createIndexes();

    console.log('✅ Database cleared successfully');
    
    // Seed fresh data
    await seedData();
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// If called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockbeaver')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return migrateFresh();
    })
    .then(() => {
      console.log('🚀 Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateFresh;