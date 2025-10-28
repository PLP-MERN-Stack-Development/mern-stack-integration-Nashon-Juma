const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalInvestment: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure unique combination of user and stock
portfolioSchema.index({ user: 1, stock: 1 }, { unique: true });

// Virtual for current value
portfolioSchema.virtual('currentValue').get(function() {
  return this.quantity * (this.stock.currentPrice || 0);
});

// Virtual for profit/loss
portfolioSchema.virtual('profitLoss').get(function() {
  return this.currentValue - this.totalInvestment;
});

// Virtual for profit/loss percentage
portfolioSchema.virtual('profitLossPercent').get(function() {
  return ((this.profitLoss / this.totalInvestment) * 100) || 0;
});

module.exports = mongoose.model('Portfolio', portfolioSchema);