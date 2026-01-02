// src/pages/AddTripPage.js
import React, { useState } from 'react';
import axios from 'axios';
import './AddTripPage.css';

const API_URL = 'http://localhost:5001/api';

function AddTripPage( ) {
  // State yo kubika amakuru y'urugendo
  const [tripInfo, setTripInfo] = useState({
    date: '',
    loadMaster: '',
    plate: '',
  });

  // State yo kubika amakuru y'umukiriya urimo wandikwa
  const [clientInfo, setClientInfo] = useState({
    name: '',
    destination: 'Rusizi',
    largeSacks: 0,
    smallSacks: 0,
    includeUnpacking: false,
    advance: 0,
  });

  // State yo kubika urutonde rwa manifesite
  const [manifest, setManifest] = useState([]);

  // Function yo guhindura amakuru y'urugendo
  const handleTripInfoChange = (e) => {
    const { id, value } = e.target;
    setTripInfo(prev => ({ ...prev, [id]: value }));
  };

  // Function yo guhindura amakuru y'umukiriya
  const handleClientInfoChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value);
    setClientInfo(prev => ({ ...prev, [id]: val }));
  };

  // Function yo kongera umukiriya kuri manifesite
  const handleAddClient = (e) => {
    e.preventDefault();
    if (!clientInfo.name || (clientInfo.largeSacks <= 0 && clientInfo.smallSacks <= 0)) {
      alert("Nyamuneka shyiramo izina ry'umukiriya n'umubare w'imifuka.");
      return;
    }
    setManifest(prev => [...prev, { ...clientInfo, id: Date.now() }]);
    // Subiza form ku busa
    setClientInfo({
      name: '',
      destination: 'Rusizi',
      largeSacks: 0,
      smallSacks: 0,
      includeUnpacking: false,
      advance: 0,
    });
  };

  // Function yo kubika urugendo rwose
  const handleSaveTrip = async (e) => {
    e.preventDefault();
    if (!tripInfo.date || !tripInfo.loadMaster || manifest.length === 0) {
      alert("Nyamuneka uzuze amakuru yose y'urugendo kandi wongereho nibura umukiriya umwe.");
      return;
    }

    const tripData = {
      tripInfo: tripInfo,
      manifest: manifest,
    };

    try {
      const response = await axios.post(`${API_URL}/historical-trips`, tripData);
      if (response.data.status === 'success') {
        alert("Urugendo rw'amateka rubitswe neza!");
        // Subiza byose ku busa
        setTripInfo({ date: '', loadMaster: '', plate: '' });
        setManifest([]);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Habaye ikibazo mu kubika urugendo.");
    }
  };

  return (
    <div className="add-trip-container">
      <h2>Enter Historical Trip Details</h2>
      
      <form className="trip-form" onSubmit={handleSaveTrip}>
        {/* Igice cya mbere: Trip Information */}
        <div className="form-section">
          <h3>Trip Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Trip Date</label>
              <input type="date" id="date" value={tripInfo.date} onChange={handleTripInfoChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="loadMaster">Load Master (Driver)</label>
              <input type="text" id="loadMaster" placeholder="e.g., John Doe" value={tripInfo.loadMaster} onChange={handleTripInfoChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="plate">Vehicle Plate</label>
              <input type="text" id="plate" placeholder="e.g., RAE 123 B" value={tripInfo.plate} onChange={handleTripInfoChange} />
            </div>
          </div>
        </div>

        {/* Igice cya kabiri: Add Client to Manifest */}
        <div className="form-section">
          <h3>Add Client to Manifest</h3>
          <div className="form-row client-form">
            <div className="form-group">
              <label htmlFor="name">Client Name</label>
              <input type="text" id="name" placeholder="Client's name" value={clientInfo.name} onChange={handleClientInfoChange} />
            </div>
            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <select id="destination" value={clientInfo.destination} onChange={handleClientInfoChange}>
                <option value="Rusizi">Rusizi</option>
                <option value="Goma">Goma</option>
                <option value="Kwa Rehema">Kwa Rehema</option>
                <option value="Kwa Aroni">Kwa Aroni</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="largeSacks">Large Sacks</label>
              <input type="number" id="largeSacks" value={clientInfo.largeSacks} onChange={handleClientInfoChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="smallSacks">Small Sacks</label>
              <input type="number" id="smallSacks" value={clientInfo.smallSacks} onChange={handleClientInfoChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="advance">Advance Paid (Rwf)</label>
              <input type="number" id="advance" value={clientInfo.advance} onChange={handleClientInfoChange} min="0" />
            </div>
            <div className="form-group checkbox-group">
              <input type="checkbox" id="includeUnpacking" checked={clientInfo.includeUnpacking} onChange={handleClientInfoChange} />
              <label htmlFor="includeUnpacking">Include Unpacking Fees?</label>
            </div>
          </div>
          <button onClick={handleAddClient} className="add-client-btn">Add Client</button>
        </div>

        {/* Igice cya gatatu: Manifest Table */}
        {manifest.length > 0 && (
          <div className="form-section">
            <h3>Manifest Summary</h3>
            <table className="manifest-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Destination</th>
                  <th>Large</th>
                  <th>Small</th>
                  <th>Unpacking</th>
                  <th>Advance</th>
                </tr>
              </thead>
              <tbody>
                {manifest.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.destination}</td>
                    <td>{item.largeSacks}</td>
                    <td>{item.smallSacks}</td>
                    <td>{item.includeUnpacking ? 'Yes' : 'No'}</td>
                    <td>{Number(item.advance).toLocaleString()} Rwf</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Igice cya kane: Save Trip */}
        <div className="form-section">
          <h3>Trip Summary & Actions</h3>
          <button type="submit" className="save-trip-btn">Save Historical Trip</button>
        </div>
      </form>
    </div>
  );
}

export default AddTripPage;
