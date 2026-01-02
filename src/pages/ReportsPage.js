// src/pages/ReportsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TripDetailsPage from './TripDetailsPage'; // Iyi import ni ingenzi
import './ReportsPage.css';

const API_URL = 'http://localhost:5001/api';

const PRICING = {
  PER_LARGE_SACK: 23000,
  PER_SMALL_SACK: 4600,
  UNPACKING_FEE_LARGE: 300,
  UNPACKING_FEE_SMALL: 50,
};

function ReportsPage( ) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // === IYI NI YO MPINDURKA Y'INGENZI ===
  // Aho guhindura page, ubu dufite state yo kumenya urugendo rwahiswemo
  const [selectedTripId, setSelectedTripId] = useState(null);

  useEffect(() => {
    // Iyi function izakora gusa iyo selectedTripId ari null
    if (!selectedTripId) {
      const fetchTrips = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL}/historical-trips`);
          setTrips(response.data.trips || []);
        } catch (err) {
          setError('Could not load trips.');
        } finally {
          setLoading(false);
        }
      };
      fetchTrips();
    }
  }, [selectedTripId]); // Iyi useEffect izongera gukora gusa iyo selectedTripId ihindutse

  const calculateTotals = (trip) => {
    let totalExpected = 0, totalCollected = 0;
    trip.manifest.forEach(client => {
      if (client.destination !== 'Goma') {
        const sacksCost = (client.largeSacks * PRICING.PER_LARGE_SACK) + (client.smallSacks * PRICING.PER_SMALL_SACK);
        const unpackingCost = client.includeUnpacking ? (client.largeSacks * PRICING.UNPACKING_FEE_LARGE) + (client.smallSacks * PRICING.UNPACKING_FEE_SMALL) : 0;
        totalExpected += sacksCost + unpackingCost + client.advance;
      }
      if (client.payments) { totalCollected += client.payments.reduce((sum, p) => sum + p.amount, 0); }
    });
    const outstanding = totalExpected - totalCollected;
    return { totalExpected, totalCollected, outstanding };
  };

  // === IYI NI LOGIC NSHYA YO GUHINDURA PAGE ===
  // Niba hari urugendo rwahiswemo, fungura TripDetailsPage
  if (selectedTripId) {
    return <TripDetailsPage tripId={selectedTripId} onBack={() => setSelectedTripId(null)} />;
  }

  // Niba nta rugendo rwahiswemo, erekana urutonde rw'ingendo
  if (loading) return <p>Loading reports...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="reports-container">
      <h3>Trip Summary Report</h3>
      <div className="table-responsive">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Trip Date</th>
              <th>Load Master / Plate</th>
              <th>Expected Revenue</th>
              <th>Total Collected</th>
              <th>Outstanding Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => {
              const { totalExpected, totalCollected, outstanding } = calculateTotals(trip);
              return (
                <tr key={trip.id}>
                  <td>{trip.date}</td>
                  <td>{trip.loadMaster} ({trip.plate})</td>
                  <td>{totalExpected.toLocaleString()} Rwf</td>
                  <td className="collected">{totalCollected.toLocaleString()} Rwf</td>
                  <td className="outstanding">{outstanding.toLocaleString()} Rwf</td>
                  {/* Iyi buto ubu ihindura gusa state, ntabwo ihamagara page nshya */}
                  <td><button onClick={() => setSelectedTripId(trip.id)} className="details-btn">View Details</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
