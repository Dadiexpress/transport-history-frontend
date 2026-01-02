// src/components/DashboardContent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardContent.css';

const API_URL = 'http://localhost:5001/api';

function DashboardContent( ) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API_URL}/historical-trips`);
        if (response.data.status === 'success') {
          setTrips(response.data.trips);
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error);
        alert("Could not load historical trips.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div className="dashboard-content-container">
      <h3>Recently Added Historical Trips</h3>
      {trips.length === 0 ? (
        <p>No historical trips found. Go to "Add Historical Trip" to add one.</p>
      ) : (
        <table className="trips-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Load Master</th>
              <th>Vehicle Plate</th>
              <th>Clients</th>
              <th>Total Sacks</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id}>
                <td>{trip.date}</td>
                <td>{trip.loadMaster}</td>
                <td>{trip.plate || 'N/A'}</td>
                <td>{trip.manifest.length}</td>
                <td>
                  {trip.manifest.reduce((total, client) => total + client.largeSacks + client.smallSacks, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DashboardContent;
