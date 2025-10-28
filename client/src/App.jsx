import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import TradeHistory from './pages/TradeHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/stocks" element={<Stocks />} />
                <Route path="/stocks/:id" element={<StockDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/portfolio" 
                  element={
                    <ProtectedRoute>
                      <Portfolio />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trades" 
                  element={
                    <ProtectedRoute>
                      <TradeHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;