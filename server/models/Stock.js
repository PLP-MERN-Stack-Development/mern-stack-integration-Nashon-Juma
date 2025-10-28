const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  openingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  high: {
    type: Number,
    required: true,
    min: 0
  },
  low: {
    type: Number,
    required: true,
    min: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  sector: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update price and calculate changes
stockSchema.methods.updatePrice = function(newPrice) {
  this.change = newPrice - this.openingPrice;
  this.changePercent = ((this.change / this.openingPrice) * 100);
  this.currentPrice = newPrice;
  
  if (newPrice > this.high) this.high = newPrice;
  if (newPrice < this.low) this.low = newPrice;
  
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('Stock', stockSchema);