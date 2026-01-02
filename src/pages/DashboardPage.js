// src/pages/DashboardPage.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AddTripPage from './AddTripPage';
import DashboardContent from '../components/DashboardContent';
import RecordPaymentsPage from './RecordPaymentsPage';
import ReportsPage from './ReportsPage';
import AddExpensePage from './AddExpensePage';
// === TWASIMBUJE 'ExpensesReportPage' NA 'CollectorLedgerPage' ===
import CollectorLedgerPage from './CollectorLedgerPage'; 
import './DashboardPage.css';

function DashboardPage({ user, onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Add Historical Trip':
        return <AddTripPage />;
      case 'Add Expense':
        return <AddExpensePage user={user} />;
      case 'Record Payments':
        return <RecordPaymentsPage user={user} />;
      case 'Reports':
        return <ReportsPage />;
      // === IYI NI CASE NSHYA Y'INGENZI ===
      case 'Collector Ledger':
        return <CollectorLedgerPage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
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
