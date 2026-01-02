// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import LoginPage from './pages/LoginPage'; // Tuzakora iyi file
import DashboardPage from './pages/DashboardPage'; // Tuzakora iyi file
import './App.css';

function App() {
  // Iyi state izatubwira niba umuntu yinjiyemo n'amakuru ye
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Niba user atarinjiramo, yerekwe Login Page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Niba user yarinjiyemo, yerekwe Dashboard
  // Tuzahindura iyi code kugira ngo yerekane pages zitandukanye
  return <DashboardPage user={user} onLogout={handleLogout} />;
}

export default App;
