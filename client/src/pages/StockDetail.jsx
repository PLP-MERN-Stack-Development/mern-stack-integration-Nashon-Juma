import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStocks } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { tradesAPI } from '../services/api';

const StockDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStockById } = useStocks();
  const { user } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [tradeType, setTradeType] = useState('BUY');
  const [isTrading, setIsTrading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState('');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const stockData = await getStockById(id);
        setStock(stockData);
      } catch (err) {
        setError(err.error || 'Failed to fetch stock details');
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [id, getStockById]);

  const handleTrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (tradeQuantity <= 0) {
      setTradeMessage('Quantity must be greater than 0');
      return;
    }

    setIsTrading(true);
    setTradeMessage('');

    try {
      const response = await tradesAPI.executeTrade({
        stockId: stock._id,
        type: tradeType,
        quantity: parseInt(tradeQuantity)
      });

      setTradeMessage(
        `Successfully ${tradeType.toLowerCase()}ed ${tradeQuantity} shares of ${stock.symbol} at $${stock.currentPrice.toFixed(2)} per share`
      );
      
      // Reset form
      setTradeQuantity(1);
      
      // Refresh stock data
      const updatedStock = await getStockById(id);
      setStock(updatedStock);

    } catch (err) {
      setTradeMessage(err.error || 'Trade failed');
    } finally {
      setIsTrading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const totalCost = stock ? tradeQuantity * stock.currentPrice : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">Stock not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Stock Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
              <p className="text-gray-600 text-lg">{stock.name}</p>
              <p className="text-gray-500">{stock.sector}</p>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(stock.currentPrice)}
              </div>
              <div className={`text-lg font-semibold ${stock.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Stock Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Trading Data</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Opening Price:</dt>
                      <dd className="font-semibold">{formatCurrency(stock.openingPrice)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Daily High:</dt>
                      <dd className="font-semibold">{formatCurrency(stock.high)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Daily Low:</dt>
                      <dd className="font-semibold">{formatCurrency(stock.low)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Volume:</dt>
                      <dd className="font-semibold">{formatNumber(stock.volume)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Market Cap:</dt>
                      <dd className="font-semibold">
                        {stock.marketCap >= 1000000000 
                          ? `$${(stock.marketCap / 1000000000).toFixed(1)}B`
                          : `$${(stock.marketCap / 1000000).toFixed(1)}M`
                        }
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Sector:</dt>
                      <dd className="font-semibold">{stock.sector}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Last Updated:</dt>
                      <dd className="font-semibold">
                        {new Date(stock.lastUpdated).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {stock.description || `${stock.name} is a leading company in the ${stock.sector} sector.`}
                </p>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Trade {stock.symbol}</h2>
            
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Please log in to start trading</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Login to Trade
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trade Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTradeType('BUY')}
                        className={`py-2 px-4 rounded-md transition duration-200 ${
                          tradeType === 'BUY'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setTradeType('SELL')}
                        className={`py-2 px-4 rounded-md transition duration-200 ${
                          tradeType === 'SELL'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Price
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stock.currentPrice)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total {tradeType === 'BUY' ? 'Cost' : 'Proceeds'}
                    </label>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalCost)}
                    </div>
                  </div>

                  {user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Balance
                      </label>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(user.balance)}
                      </div>
                    </div>
                  )}

                  {tradeMessage && (
                    <div className={`p-3 rounded-md ${
                      tradeMessage.includes('Successfully') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tradeMessage}
                    </div>
                  )}

                  <button
                    onClick={handleTrade}
                    disabled={isTrading || (tradeType === 'BUY' && totalCost > user.balance)}
                    className={`w-full py-3 px-4 rounded-md font-semibold transition duration-200 ${
                      tradeType === 'BUY'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } ${
                      (isTrading || (tradeType === 'BUY' && totalCost > user.balance)) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    {isTrading ? 'Processing...' : `${tradeType} ${stock.symbol}`}
                  </button>

                  {tradeType === 'BUY' && totalCost > user.balance && (
                    <div className="text-red-600 text-sm text-center">
                      Insufficient balance for this trade
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;