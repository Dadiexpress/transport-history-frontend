// src/App.js (FINAL CORRECTED VERSION - FIXES ROUTING & HYDRATION)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddTripPage from './pages/AddTripPage';
import AddExpensePage from './pages/AddExpensePage';
import RecordPaymentsPage from './pages/RecordPaymentsPage';
import ReportsPage from './pages/ReportsPage';
import CollectorLedgerPage from './pages/CollectorLedgerPage';
import SettingsPage from './pages/SettingsPage';
import TripDetailsPage from './pages/TripDetailsPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    // Iyi function ubu ibika user na token muri localStorage
    setUser(userData.user); // Twizere ko backend isubiza object ya user
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('token', userData.access_token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Niba tukirimo gusoma localStorage, twerekane ubutumwa bwo gutegereza
  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          
          {/* Izi routes zose zireba gusa abantu binjiye */}
          <Route element={<ProtectedRoute user={user} />}>
            <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
              <Route path="/dashboard" element={<DashboardPage user={user} />} />
              <Route path="/add-trip" element={<AddTripPage user={user} />} />
              <Route path="/add-expense" element={<AddExpensePage user={user} />} />
              <Route path="/record-payments" element={<RecordPaymentsPage user={user} />} />
              <Route path="/reports" element={<ReportsPage user={user} />} />
              <Route path="/ledger" element={<CollectorLedgerPage user={user} />} />
              <Route path="/settings" element={<SettingsPage user={user} />} />
              <Route path="/trip/:tripId" element={<TripDetailsPage user={user} />} />
            </Route>
          </Route>
          
          {/* Iyo umuntu ayobye inzira */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
