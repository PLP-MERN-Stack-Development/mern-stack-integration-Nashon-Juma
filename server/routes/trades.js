const express = require('express');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's trades
router.get('/my-trades', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const trades = await Trade.find({ user: req.user.userId })
      .populate('stock', 'symbol name')
      .sort({ executedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trade.countDocuments({ user: req.user.userId });

    res.json({
      success: true,
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Execute trade (BUY/SELL)
router.post('/execute', auth, async (req, res) => {
  try {
    const { stockId, type, quantity } = req.body;

    // Validate input
    if (!['BUY', 'SELL'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid trade type'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity'
      });
    }

    // Get stock and user
    const stock = await Stock.findById(stockId);
    const user = await User.findById(req.user.userId);

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    const totalCost = quantity * stock.currentPrice;

    if (type === 'BUY') {
      // Check if user has enough balance
      if (user.balance < totalCost) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance'
        });
      }

      // Update user balance
      user.balance -= totalCost;
      await user.save();

      // Update portfolio
      let portfolio = await Portfolio.findOne({
        user: req.user.userId,
        stock: stockId
      });

      if (portfolio) {
        const newTotalQuantity = portfolio.quantity + quantity;
        const newTotalInvestment = portfolio.totalInvestment + totalCost;
        
        portfolio.quantity = newTotalQuantity;
        portfolio.averagePrice = newTotalInvestment / newTotalQuantity;
        portfolio.totalInvestment = newTotalInvestment;
      } else {
        portfolio = new Portfolio({
          user: req.user.userId,
          stock: stockId,
          quantity: quantity,
          averagePrice: stock.currentPrice,
          totalInvestment: totalCost
        });
      }

      await portfolio.save();
    } else { // SELL
      // Check if user has enough shares
      const portfolio = await Portfolio.findOne({
        user: req.user.userId,
        stock: stockId
      });

      if (!portfolio || portfolio.quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient shares'
        });
      }

      // Update user balance
      user.balance += totalCost;
      await user.save();

      // Update portfolio
      portfolio.quantity -= quantity;
      portfolio.totalInvestment = portfolio.quantity * portfolio.averagePrice;
      
      if (portfolio.quantity === 0) {
        await Portfolio.findByIdAndDelete(portfolio._id);
      } else {
        await portfolio.save();
      }
    }

    // Create trade record
    const trade = await Trade.create({
      user: req.user.userId,
      stock: stockId,
      type,
      quantity,
      price: stock.currentPrice,
      totalAmount: totalCost
    });

    await trade.populate('stock', 'symbol name');

    res.json({
      success: true,
      trade,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;