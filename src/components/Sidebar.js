// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user, onLogout }) {
  // Twemeza ko user object ihari mbere yo kugerageza gusoma username
  const username = user ? user.username : 'Guest'; 

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Transport History</h2>
        <p>Welcome, {username}</p>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">Dashboard</Link>
        <Link to="/add-trip" className="nav-item">Add Historical Trip</Link>
        <Link to="/add-expense" className="nav-item">Add Expense</Link>
        <Link to="/record-payments" className="nav-item">Record Payments</Link>
        <Link to="/reports" className="nav-item">Reports</Link>
        <Link to="/collector-ledger" className="nav-item">Collector Ledger</Link>
      </nav>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
