// src/pages/RecordPaymentsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecordPaymentsPage.css';
// === IYI NI YO MPINDURKA Y'INGENZI ===
import API_URL from '../apiConfig'; // Twakuyeho URL ya localhost

const PRICING = {
  PER_LARGE_SACK: 23000,
  PER_SMALL_SACK: 4600,
  UNPACKING_FEE_LARGE: 300,
  UNPACKING_FEE_SMALL: 50,
};

function ClientPaymentDetails({ client, tripId, onPaymentDeleted } ) {
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = async (paymentId) => {
    const deletionData = {
      tripId: tripId,
      clientId: client.id,
      paymentId: paymentId,
    };

    if (!window.confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/payments`, {
        data: deletionData
      });
      if (response.data.status === 'success') {
        alert(response.data.message);
        onPaymentDeleted();
      }
    } catch (error) {
      console.error("Deletion failed with error:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Failed to delete payment.");
    }
  };

  if (!client.payments || client.payments.length === 0) return null;

  return (
    <div className="payment-details-container">
      <button onClick={() => setShowDetails(!showDetails)} className="details-toggle-btn">
        {showDetails ? 'Hide' : 'View'} {client.payments.length} Payment(s)
      </button>
      {showDetails && (
        <table className="payment-details-table">
          <thead><tr><th>Date</th><th>Collected By</th><th>Amount</th><th>Action</th></tr></thead>
          <tbody>
            {client.payments.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>{p.collected_by}</td>
                <td>{p.amount.toLocaleString()} Rwf</td>
                <td><button onClick={() => handleDelete(p.id)} className="delete-btn">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RecordPaymentsPage({ user }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState({});
  const [isSaving, setIsSaving] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/historical-trips`);
      setTrips(response.data.trips || []);
    } catch (err) {
      setError("Could not load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const selectedTrip = trips.find(t => t.id === parseInt(selectedTripId));

  const handleSavePayment = async (clientId) => {
    const amount = payments[clientId];
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    setIsSaving(clientId);
    const paymentData = { tripId: selectedTripId, clientId: clientId, amount: amount, collectedBy: user.username };
    try {
      const response = await axios.post(`${API_URL}/payments`, paymentData);
      if (response.data.status === 'success') {
        alert(response.data.message);
        setPayments(prev => ({ ...prev, [clientId]: '' }));
        fetchTrips(); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save the payment.");
    } finally {
      setIsSaving(null);
    }
  };

  const handlePaymentChange = (clientId, amount) => {
    setPayments(prev => ({ ...prev, [clientId]: amount }));
  };

  const renderContent = () => {
    if (loading) return <p>Loading trips...</p>;
    if (error) return <p className="error-message">{error}</p>;
    return (
      <div className="form-group">
        <label htmlFor="trip-select">Trip</label>
        <select id="trip-select" value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)}>
          <option value="">-- Select a Trip --</option>
          {trips.map(trip => (
            <option key={trip.id} value={trip.id}>{trip.date} - {trip.loadMaster} ({trip.plate || 'N/A'})</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="record-payments-container">
      <div className="form-section">
        <h3>Select a Trip to Record Payments</h3>
        {renderContent()}
      </div>
      {selectedTrip && (
        <div className="form-section">
          <h3>Client Manifest for Trip on {selectedTrip.date}</h3>
          <div className="table-responsive">
            <table className="payments-table">
              <thead><tr><th>Client Name</th><th>Total Due</th><th>Total Paid</th><th>Balance Due</th><th>Payment Action</th></tr></thead>
              <tbody>
                {selectedTrip.manifest.map(client => {
                  const sacksCost = (client.largeSacks * PRICING.PER_LARGE_SACK) + (client.smallSacks * PRICING.PER_SMALL_SACK);
                  const unpackingCost = client.includeUnpacking ? (client.largeSacks * PRICING.UNPACKING_FEE_LARGE) + (client.smallSacks * PRICING.UNPACKING_FEE_SMALL) : 0;
                  const totalDue = sacksCost + unpackingCost + client.advance;
                  const totalPaid = client.payments ? client.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
                  const balanceDue = totalDue - totalPaid;
                  const isGomaTrip = client.destination === 'Goma';
                  return (
                    <React.Fragment key={client.id}>
                      <tr className={isGomaTrip ? 'goma-trip' : ''}>
                        <td><div>{client.name}</div><div className="client-destination">{client.destination}</div></td>
                        <td>{totalDue.toLocaleString()} Rwf</td>
                        <td className="total-paid">{totalPaid.toLocaleString()} Rwf</td>
                        <td className="balance-due">{balanceDue.toLocaleString()} Rwf</td>
                        <td className="payment-action-cell">
                          {isGomaTrip ? <span className="goma-label">GOMA TRIP</span> : (
                            <>
                              <input type="number" placeholder="Amount" className="payment-input" value={payments[client.id] || ''} onChange={(e) => handlePaymentChange(client.id, e.target.value)} disabled={balanceDue <= 0 || isSaving === client.id} />
                              <button className="save-payment-btn" onClick={() => handleSavePayment(client.id)} disabled={balanceDue <= 0 || isSaving === client.id}>
                                {isSaving === client.id ? 'Saving...' : (balanceDue <= 0 ? 'Paid' : 'Save')}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                      {!isGomaTrip && (<tr className="details-row"><td colSpan="5"><ClientPaymentDetails client={client} tripId={selectedTrip.id} onPaymentDeleted={fetchTrips} /></td></tr>)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordPaymentsPage;
