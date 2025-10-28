const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');

// Generate fake company names and symbols
const generateCompanyName = () => {
  const prefixes = ['Global', 'National', 'International', 'United', 'Advanced', 'Premium', 'Elite', 'Prime'];
  const middles = ['Tech', 'Data', 'Cloud', 'Digital', 'Smart', 'Innovative', 'Future', 'Next'];
  const suffixes = ['Corp', 'Inc', 'Ltd', 'Group', 'Holdings', 'Solutions', 'Systems', 'Technologies'];
  
  const name = `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(middles)} ${faker.helpers.arrayElement(suffixes)}`;
  return name;
};

// Generate fake stock symbols (3-4 letters)
const generateStockSymbol = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = faker.number.int({ min: 3, max: 4 });
  let symbol = '';
  for (let i = 0; i < length; i++) {
    symbol += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return symbol;
};

// Generate unique symbols
const generateUniqueSymbols = (count) => {
  const symbols = new Set();
  while (symbols.size < count) {
    symbols.add(generateStockSymbol());
  }
  return Array.from(symbols);
};

// Sectors for realistic distribution
const sectors = [
  'Technology', 'Financial Services', 'Healthcare', 'Consumer Cyclical',
  'Communication Services', 'Industrials', 'Consumer Defensive',
  'Energy', 'Utilities', 'Real Estate', 'Materials'
];

// Generate realistic company descriptions based on sector
const generateCompanyDescription = (sector, companyName) => {
  const descriptions = {
    'Technology': [
      `Leading provider of innovative software solutions and digital transformation services.`,
      `Pioneering ${faker.helpers.arrayElement(['AI', 'cloud', 'cybersecurity', 'IoT'])} technologies for modern businesses.`,
      `Global technology company specializing in ${faker.helpers.arrayElement(['enterprise software', 'data analytics', 'digital platforms', 'smart solutions'])}.`
    ],
    'Financial Services': [
      `Comprehensive financial services provider offering ${faker.helpers.arrayElement(['banking', 'investment', 'wealth management', 'insurance'])} solutions.`,
      `Trusted financial institution with global presence and innovative ${faker.helpers.arrayElement(['digital banking', 'fintech', 'payment'])} services.`
    ],
    'Healthcare': [
      `Innovative healthcare company developing ${faker.helpers.arrayElement(['pharmaceuticals', 'medical devices', 'healthtech solutions', 'biotech innovations'])}.`,
      `Leading provider of ${faker.helpers.arrayElement(['healthcare services', 'medical research', 'patient care solutions', 'health insurance'])}.`
    ],
    'Consumer Cyclical': [
      `Premier ${faker.helpers.arrayElement(['retail', 'automotive', 'entertainment', 'hospitality'])} company with strong brand presence.`,
      `Global consumer brand offering ${faker.helpers.arrayElement(['quality products', 'exceptional services', 'innovative experiences'])}.`
    ],
    'Communication Services': [
      `Leading ${faker.helpers.arrayElement(['telecommunications', 'media', 'entertainment', 'digital content'])} provider.`,
      `Innovative communications company delivering ${faker.helpers.arrayElement(['connectivity solutions', 'media services', 'digital entertainment'])}.`
    ]
  };

  const defaultDescription = `Leading company in the ${sector} sector, committed to excellence and innovation.`;
  
  return faker.helpers.arrayElement(descriptions[sector] || [defaultDescription]);
};

// Generate realistic stock data
const generateStockData = (symbol) => {
  const companyName = generateCompanyName();
  const sector = faker.helpers.arrayElement(sectors);
  const basePrice = faker.number.float({ min: 5, max: 800, fractionDigits: 2 });
  const volatility = faker.number.float({ min: 0.01, max: 0.1 }); // Stock volatility
  const changeAmount = basePrice * volatility * (faker.datatype.boolean() ? 1 : -1);
  const currentPrice = basePrice + changeAmount;
  const openingPrice = basePrice;
  const change = currentPrice - openingPrice;
  const changePercent = (change / openingPrice) * 100;
  
  // Ensure high is highest and low is lowest
  const high = Math.max(currentPrice, openingPrice) * (1 + faker.number.float({ min: 0.001, max: 0.05 }));
  const low = Math.min(currentPrice, openingPrice) * (1 - faker.number.float({ min: 0.001, max: 0.05 }));

  return {
    symbol: symbol,
    name: companyName,
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    openingPrice: parseFloat(openingPrice.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    volume: faker.number.int({ min: 100000, max: 50000000 }),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    marketCap: faker.number.int({ min: 50000000, max: 500000000000 }),
    sector: sector,
    description: generateCompanyDescription(sector, companyName)
  };
};

// Generate sample users with fake data (FIXED Faker v8 syntax)
const generateSampleUsers = (count = 5) => {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    // Fixed Faker v8 syntax for username
    users.push({
      username: faker.internet.username({ 
        firstName: firstName, 
        lastName: lastName 
      }),
      email: faker.internet.email({ firstName, lastName }),
      password: 'password123', // Default password for demo
      balance: faker.number.float({ min: 10000, max: 200000, fractionDigits: 2 })
    });
  }
  
  // Add a consistent demo user
  users.push({
    username: 'demo',
    email: 'demo@stockbeaver.com',
    password: 'password123',
    balance: 100000.00
  });
  
  return users;
};

// Alternative simpler user generation (if above still has issues)
const generateSampleUsersSimple = (count = 5) => {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    users.push({
      username: faker.internet.userName(), // Simple version
      email: faker.internet.email(),
      password: 'password123',
      balance: faker.number.float({ min: 10000, max: 200000, fractionDigits: 2 })
    });
  }
  
  // Add a consistent demo user
  users.push({
    username: 'demo',
    email: 'demo@stockbeaver.com',
    password: 'password123',
    balance: 100000.00
  });
  
  return users;
};

// Main seed function
const seedData = async (options = {}) => {
  const {
    clearExisting = true,
    createUsers = true,
    createStocks = true,
    stockCount = 50,
    userCount = 5
  } = options;

  try {
    console.log('🌱 Starting data seeding...');

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected. Please ensure the database is running and connected.');
    }

    if (clearExisting) {
      console.log('🧹 Clearing existing data...');
      
      // Use Promise.all for parallel deletion
      await Promise.all([
        Stock.deleteMany({}),
        User.deleteMany({}),
        Trade.deleteMany({}),
        Portfolio.deleteMany({})
      ]);
      console.log('✅ All existing data cleared');
    }

    const results = {};

    // Generate stocks
    if (createStocks) {
      console.log('📈 Generating fake stocks...');
      const uniqueSymbols = generateUniqueSymbols(stockCount);
      const stockData = uniqueSymbols.map(symbol => generateStockData(symbol));
      
      await Stock.insertMany(stockData);
      results.stocks = stockData.length;
      console.log(`✅ Generated ${stockData.length} fake stocks`);
      
      // Show some sample stocks
      console.log('\n📊 Sample stocks generated:');
      stockData.slice(0, 5).forEach(stock => {
        console.log(`   ${stock.symbol} - ${stock.name} - $${stock.currentPrice}`);
      });
    }

    // Generate users
    if (createUsers) {
      console.log('👥 Generating fake users...');
      // Use the simple version to avoid Faker API issues
      const userData = generateSampleUsersSimple(userCount);
      await User.insertMany(userData);
      results.users = userData.length;
      console.log(`✅ Generated ${userData.length} sample users`);
    }

    console.log('\n🎉 Data seeding completed successfully!');
    
    if (createUsers) {
      console.log('\n📋 Sample user credentials:');
      generateSampleUsersSimple(3).forEach(user => {
        console.log(`   👤 ${user.username} | 📧 ${user.email} | 🔑 password123 | 💰 $${user.balance.toLocaleString()}`);
      });
      console.log('   👤 demo | 📧 demo@stockbeaver.com | 🔑 password123 | 💰 $100,000.00');
    }

    return results;

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  }
};

// Export for manual use
module.exports = seedData;