require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockbeaver';

const checkDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connection: OK');
    
    // Check collections
    const Stock = require('../models/Stock');
    const User = require('../models/User');
    
    const stockCount = await Stock.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('📊 Database Status:');
    console.log(`   📈 Stocks: ${stockCount}`);
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🗃️  Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   🔗 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('💡 Make sure MongoDB is running:');
    console.log('   On macOS: brew services start mongodb-community');
    console.log('   On Windows: net start MongoDB');
    console.log('   On Linux: sudo systemctl start mongod');
  } finally {
    await mongoose.connection.close();
  }
};

checkDatabase();