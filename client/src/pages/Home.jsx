import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStocks } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { stocks, loading } = useStocks();
  const { user } = useAuth();
  const [featuredStocks, setFeaturedStocks] = useState([]);

  useEffect(() => {
    if (stocks.length > 0) {
      // Show top 6 stocks with highest volume
      const topStocks = [...stocks]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 6);
      setFeaturedStocks(topStocks);
    }
  }, [stocks]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to StockBeaver</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Your premier platform for stock trading and portfolio management. 
            Trade with confidence and build your financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/stocks"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-200"
                >
                  Browse Stocks
                </Link>
              </>
            ) : (
              <Link
                to="/stocks"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
              >
                Start Trading
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose StockBeaver?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Trading</h3>
              <p className="text-gray-600">
                Execute trades instantly with real-time market data and lightning-fast order execution.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                Comprehensive portfolio tracking with detailed analytics and performance metrics.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                Bank-level security with encrypted transactions and secure user authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stocks Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Stocks</h2>
            <Link
              to="/stocks"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Stocks →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStocks.map((stock) => (
              <div key={stock._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{stock.symbol}</h3>
                    <p className="text-gray-600 text-sm">{stock.name}</p>
                  </div>
                  <span className={`text-lg font-semibold ${stock.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                    {formatCurrency(stock.currentPrice)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Change:</span>
                    <div className={`font-semibold ${stock.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Volume:</span>
                    <div className="font-semibold">{formatNumber(stock.volume)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Sector:</span>
                    <div className="font-semibold">{stock.sector}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Market Cap:</span>
                    <div className="font-semibold">
                      {stock.marketCap >= 1000000000 
                        ? `$${(stock.marketCap / 1000000000).toFixed(1)}B`
                        : `$${(stock.marketCap / 1000000).toFixed(1)}M`
                      }
                    </div>
                  </div>
                </div>
                <Link
                  to={`/stocks/${stock._id}`}
                  className="block mt-4 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Stocks Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$0</div>
              <div className="text-blue-200">Commission Fees</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Trading Access</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-blue-200">Secure Platform</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;