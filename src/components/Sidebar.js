// src/components/Sidebar.js
import React from 'react';
import './Sidebar.css';

function Sidebar({ user, onLogout, activePage, setActivePage, isCollapsed, setIsCollapsed }) {
  // === TWASIMBUJE "Expenses Report" NA "Collector Ledger" ===
  const menuItems = [
    'Dashboard', 
    'Add Historical Trip', 
    'Add Expense', 
    'Record Payments', 
    'Reports', 
    'Collector Ledger' // Iyi ni yo mpinduka
  ];

  const handleLinkClick = (page) => {
    setActivePage(page);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>Transport History</h2>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-btn">
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item}>
              <a 
                href="#" 
                className={activePage === item ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item);
                }}
                title={item}
              >
                <span className="nav-text">{item}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
