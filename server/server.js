// server.js - Main server file for StockBeaver
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const stockRoutes = require('./routes/stocks');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const portfolioRoutes = require('./routes/portfolio');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// API routes
app.use('/api/stocks', stockRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Manual seeding endpoint (for development)
app.post('/api/seed', async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const seedData = require('./utils/seedData');
      await seedData();
      res.json({ 
        success: true, 
        message: 'Database seeded successfully with 50 stocks and sample users' 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else {
    res.status(403).json({
      success: false,
      error: 'Seeding not allowed in production'
    });
  }
});

// Clear database endpoint (for development)
app.delete('/api/seed', async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const Stock = require('./models/Stock');
      const User = require('./models/User');
      const Trade = require('./models/Trade');
      const Portfolio = require('./models/Portfolio');
      
      await Stock.deleteMany({});
      await User.deleteMany({});
      await Trade.deleteMany({});
      await Portfolio.deleteMany({});
      
      res.json({ 
        success: true, 
        message: 'Database cleared successfully' 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else {
    res.status(403).json({
      success: false,
      error: 'Database clearing not allowed in production'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'StockBeaver API is running',
    version: '1.0.0',
    endpoints: {
      stocks: '/api/stocks',
      auth: '/api/auth',
      trades: '/api/trades',
      portfolio: '/api/portfolio',
      seed: '/api/seed (POST/DELETE - development only)'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockbeaver')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Auto-seed only if no stocks exist (with better error handling)
    const Stock = require('./models/Stock');
    Stock.countDocuments()
      .then(count => {
        if (count === 0) {
          console.log('🌱 No stocks found, auto-seeding database...');
          const seedData = require('./utils/seedData');
          seedData().catch(err => {
            console.error('❌ Auto-seeding failed:', err.message);
          });
        } else {
          console.log(`📊 Found ${count} existing stocks in database`);
        }
      })
      .catch(err => {
        console.error('❌ Error checking stock count:', err.message);
      });
    
    app.listen(PORT, () => {
      console.log(`🚀 StockBeaver server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}`);
      console.log(`🌱 Manual seeding: POST http://localhost:${PORT}/api/seed`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
    console.log('💡 Make sure MongoDB is running on your system');
    process.exit(1);
  });


module.exports = app;