const express = require('express');
const Stock = require('../models/Stock');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sector } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (sector) {
      query.sector = sector;
    }

    const stocks = await Stock.find(query)
      .sort({ symbol: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Stock.countDocuments(query);

    res.json({
      success: true,
      stocks,
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

// Get single stock
router.get('/:id', async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    res.json({
      success: true,
      stock
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get stock by symbol
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    res.json({
      success: true,
      stock
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update stock price (admin only)
router.patch('/:id/price', auth, async (req, res) => {
  try {
    const { price } = req.body;
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    stock.updatePrice(parseFloat(price));
    await stock.save();

    res.json({
      success: true,
      stock
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get market sectors
router.get('/data/sectors', async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector');
    res.json({
      success: true,
      sectors
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;