// src/components/DashboardContent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardContent.css';
// === IYI NI YO MPINDURKA Y'INGENZI ===
import API_URL from '../apiConfig'; // Twakuyeho URL ya localhost

function DashboardContent() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Twongeyeho state yo gucunga error

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null); // Banza usibe error ishaje
      try {
        const response = await axios.get(`${API_URL}/historical-trips`);
        setTrips(response.data.trips || []);
      } catch (err) {
        // Aho gukora alert, ubu dushyira error muri state
        setError('Could not load historical trips.');
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };

    // === IYI NI YO LOGIC NSHYA YO GUTEGEREZA ===
    // Tegereza akanya gato (nka 100ms) kugirango application ibanze yemeze neza login
    // mbere yo guhamagara API. Ibi bikemura cya kibazo cyo kuri telephone.
    const timer = setTimeout(() => {
      fetchTrips();
    }, 100);

    // Kuraho timer iyo component ivuyeho kugirango itazakomeza gukora
    return () => clearTimeout(timer);

  }, []); // Iyi useEffect ikora inshuro imwe gusa

  // Ubu dufite uburyo bwiza bwo kwerekana loading, error, cyangwa amakuru
  if (loading) {
    return <p>Loading trips...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="dashboard-main-content">
      <h3>Recently Added Historical Trips</h3>
      {trips.length === 0 ? (
        <p>No historical trips found. Go to "Add Historical Trip" to add one.</p>
      ) : (
        <div className="table-responsive">
          <table className="dashboard-table">
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
              {/* Erekana ingendo 5 ziheruka gusa */}
              {trips.slice(0, 5).map(trip => (
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
        </div>
      )}
    </div>
  );
}

export default DashboardContent;
