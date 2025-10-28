const express = require('express');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user portfolio
router.get('/my-portfolio', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.userId })
      .populate('stock', 'symbol name currentPrice change changePercent');

    const portfolioWithCalculations = portfolio.map(item => {
      const currentValue = item.quantity * item.stock.currentPrice;
      const profitLoss = currentValue - item.totalInvestment;
      const profitLossPercent = (profitLoss / item.totalInvestment) * 100;

      return {
        ...item.toObject(),
        currentValue,
        profitLoss,
        profitLossPercent,
        todayPL: item.quantity * item.stock.change
      };
    });

    // Calculate totals
    const totalInvestment = portfolioWithCalculations.reduce((sum, item) => sum + item.totalInvestment, 0);
    const totalCurrentValue = portfolioWithCalculations.reduce((sum, item) => sum + item.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercent = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    res.json({
      success: true,
      portfolio: portfolioWithCalculations,
      summary: {
        totalInvestment,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get portfolio value over time (simplified)
router.get('/performance', auth, async (req, res) => {
  try {
    // This would typically query historical data
    // For now, return mock data or basic calculation
    const portfolio = await Portfolio.find({ user: req.user.userId })
      .populate('stock');

    const currentValue = portfolio.reduce((sum, item) => {
      return sum + (item.quantity * item.stock.currentPrice);
    }, 0);

    res.json({
      success: true,
      performance: {
        currentValue,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;