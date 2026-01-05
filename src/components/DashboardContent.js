// src/components/DashboardContent.js (FORCE REFRESH VERSION)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiConfig.js';
import './DashboardContent.css';

function DashboardContent() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/historical-trips');
      setTrips((response.data.trips || []).slice(0, 5));
    } catch (err) {
      setError('Failed to fetch trips: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip? This action is permanent.')) {
      try {
        await apiClient.delete(`/historical-trips/${tripId}`);
        alert('Trip deleted successfully.');
        fetchTrips();
      } catch (err) {
        alert('Failed to delete trip: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="dashboard-content-container">
      <h3>Recently Added Historical Trips</h3>
      {/* === IYI NI YO MPINDUKA Y'INGENZI === */}
      <table className="trips-summary-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Load Master</th>
            <th>Vehicle Plate</th>
            <th>Clients</th>
            <th>Total Sacks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.length === 0 ? (
            <tr><td colSpan="6">No recent trips found.</td></tr>
          ) : (
            trips.map(trip => {
              const tripInfo = trip.tripInfo || {};
              const manifest = trip.manifest || [];
              const totalSacks = manifest.reduce((sum, client) => sum + (parseInt(client.largeSacks, 10) || 0) + (parseInt(client.smallSacks, 10) || 0), 0);
              return (
                <tr key={tripInfo.id}>
                  <td>{new Date(tripInfo.date).toLocaleDateString()}</td>
                  <td>{tripInfo.loadMaster}</td>
                  <td>{tripInfo.plate}</td>
                  <td>{manifest.length}</td>
                  <td>{totalSacks}</td>
                  <td>
                    <button onClick={() => navigate(`/trip/${tripInfo.id}`)} className="action-btn view">View</button>
                    {user.role === 'admin' && (
                      <button onClick={() => handleDelete(tripInfo.id)} className="action-btn delete">Delete</button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardContent;
