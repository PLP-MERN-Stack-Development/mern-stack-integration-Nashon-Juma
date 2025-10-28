import React, { createContext, useState, useContext, useEffect } from 'react';
import { stocksAPI } from '../services/api';

const StockContext = createContext();

export const useStocks = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStocks must be used within a StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectors, setSectors] = useState([]);

  const fetchStocks = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await stocksAPI.getAll(params);
      setStocks(response.stocks);
      return response;
    } catch (err) {
      setError(err.error || 'Failed to fetch stocks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await stocksAPI.getSectors();
      setSectors(response.sectors);
    } catch (err) {
      console.error('Failed to fetch sectors:', err);
    }
  };

  const getStockById = async (id) => {
    try {
      const response = await stocksAPI.getById(id);
      return response.stock;
    } catch (err) {
      throw err;
    }
  };

  const searchStocks = async (searchTerm) => {
    return await fetchStocks({ search: searchTerm });
  };

  const filterBySector = async (sector) => {
    return await fetchStocks({ sector });
  };

  useEffect(() => {
    fetchStocks();
    fetchSectors();
  }, []);

  const value = {
    stocks,
    loading,
    error,
    sectors,
    fetchStocks,
    getStockById,
    searchStocks,
    filterBySector
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};