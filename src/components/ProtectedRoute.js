// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import MainLayout from './MainLayout'; // Tugomba gukoresha MainLayout twakoze
import './ProtectedRoute.css';

const ProtectedRoute = ({ isAuthenticated, user, onLogout }) => {
  if (!isAuthenticated) {
    // Niba atarinjiye, mwohereze kuri login page
    return <Navigate to="/login" replace />;
  }

  // Niba yarinjiye, mwohereze kuri MainLayout
  return (
    <MainLayout user={user} onLogout={onLogout}>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
