// src/pages/DashboardPage.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AddTripPage from './AddTripPage';
import DashboardContent from '../components/DashboardContent';
import RecordPaymentsPage from './RecordPaymentsPage';
import ReportsPage from './ReportsPage';
import AddExpensePage from './AddExpensePage';
import CollectorLedgerPage from './CollectorLedgerPage';
import './DashboardPage.css';

function DashboardPage({ user, onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard': return <DashboardContent />;
      case 'Add Historical Trip': return <AddTripPage />;
      case 'Add Expense': return <AddExpensePage user={user} />;
      case 'Record Payments': return <RecordPaymentsPage user={user} />;
      case 'Reports': return <ReportsPage />;
      case 'Collector Ledger': return <CollectorLedgerPage />;
      default: return <DashboardContent />;
    }
  };

  const handleMobileLinkClick = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* === IGIHU CYO KURI TELEPHONE (OVERLAY) === */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)} // Iyo umuntu akanze ku gihu, menu irifunga
      ></div>

      <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        &#9776;
      </button>

      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        activePage={activePage}
        setActivePage={window.innerWidth <= 768 ? handleMobileLinkClick : setActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        extraClass={isMobileMenuOpen ? 'mobile-visible' : ''}
      />

      <main className="dashboard-content">
        <div className="page-header">
          <h1>{activePage}</h1>
          <div className="user-info">
            Welcome, {user.username} ({user.role})
          </div>
        </div>
        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
