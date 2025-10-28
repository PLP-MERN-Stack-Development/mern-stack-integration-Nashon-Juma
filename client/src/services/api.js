import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Stocks API
export const stocksAPI = {
  getAll: (params = {}) => api.get('/stocks', { params }),
  getById: (id) => api.get(`/stocks/${id}`),
  getBySymbol: (symbol) => api.get(`/stocks/symbol/${symbol}`),
  updatePrice: (id, price) => api.patch(`/stocks/${id}/price`, { price }),
  getSectors: () => api.get('/stocks/data/sectors'),
};

// Trades API
export const tradesAPI = {
  getMyTrades: (params = {}) => api.get('/trades/my-trades', { params }),
  executeTrade: (tradeData) => api.post('/trades/execute', tradeData),
};

// Portfolio API
export const portfolioAPI = {
  getMyPortfolio: () => api.get('/portfolio/my-portfolio'),
  getPerformance: () => api.get('/portfolio/performance'),
};

export default api;