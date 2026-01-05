// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddTripPage from './pages/AddTripPage';
import ReportsPage from './pages/ReportsPage';
import RecordPaymentsPage from './pages/RecordPaymentsPage';
import AddExpensePage from './pages/AddExpensePage';
import CollectorLedgerPage from './pages/CollectorLedgerPage';
import TripDetailsPage from './pages/TripDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { PricingProvider } from './context/PricingContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Iki gice cyari cyaratumye habaho hydration error, ariko ubu turacyifashisha
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    // Gufata umwanya muto kugira ngo hydration itazana error
    return <div>Loading application...</div>;
  }

  return (
    <PricingProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          
          {/* Protected Routes zose zikoresha ProtectedRoute */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute 
                isAuthenticated={isAuthenticated} 
                user={user} 
                onLogout={handleLogout} 
              />
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="add-trip" element={<AddTripPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="record-payments" element={<RecordPaymentsPage />} />
            <Route path="add-expense" element={<AddExpensePage />} />
            <Route path="collector-ledger" element={<CollectorLedgerPage />} />
            <Route path="trip-details/:tripId" element={<TripDetailsPage />} />
          </Route>

          {/* Route yo kwerekana ko page itabonetse */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </PricingProvider>
  );
}

export default App;
