// src/pages/AddTripPage.js (FINAL - ENSURE THIS IS SAVED)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // IYI IMPORT NI INGENZI CYANE
import apiClient from '../apiConfig.js';
import './AddTripPage.css';

const initialClientState = { name: '', destination: 'Rusizi', largeSacks: '', smallSacks: '', includeUnpacking: false, advance: '' };

function AddTripPage() {
  const [tripInfo, setTripInfo] = useState({ date: '', loadMaster: '', plate: '' });
  const [clients, setClients] = useState([initialClientState]);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleTripInfoChange = (e) => {
    const { id, value } = e.target;
    setTripInfo(prev => ({ ...prev, [id]: value }));
  };

  const handleClientChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedClients = [...clients];
    updatedClients[index][name] = type === 'checkbox' ? checked : value;
    setClients(updatedClients);
  };

  const addClientField = () => {
    setClients([...clients, initialClientState]);
  };

  const removeClientField = (index) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!tripInfo.date || !tripInfo.loadMaster) {
      setAlert({ type: 'error', message: 'Please fill in all trip information (Date and Load Master).' });
      return;
    }

    const validClients = clients.filter(c => c.name.trim() !== '');
    if (validClients.length === 0) {
      setAlert({ type: 'error', message: 'Please add at least one client with a name.' });
      return;
    }

    const tripData = {
      tripInfo: tripInfo,
      manifest: validClients.map(c => ({
        ...c,
        largeSacks: parseInt(c.largeSacks, 10) || 0,
        smallSacks: parseInt(c.smallSacks, 10) || 0,
        advance: parseInt(c.advance, 10) || 0,
      })),
    };

    try {
      const response = await apiClient.post('/historical-trips', tripData);
      
      if (response.status === 201) {
        alert('Trip added successfully!');
        navigate('/dashboard'); 
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'An error occurred while saving the trip.' });
    }
  };

  return (
    <div className="add-trip-container">
      <h2>Add New Historical Trip</h2>
      
      {alert.message && (
        <div className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {alert.message}
        </div>
      )}

      <form className="trip-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>1. Trip Information</h3>
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

        <div className="form-section">
          <h3>2. Client Manifest</h3>
          {clients.map((client, index) => (
            <div key={index} className="client-entry">
              <div className="form-row client-form">
                <input type="text" name="name" placeholder="Client Name" value={client.name} onChange={(e) => handleClientChange(index, e)} className="client-input-name" />
                <select name="destination" value={client.destination} onChange={(e) => handleClientChange(index, e)}>
                  <option value="Rusizi">Rusizi</option>
                  <option value="Goma">Goma</option>
                  <option value="Kwa Rehema">Kwa Rehema</option>
                  <option value="Kwa Aroni">Kwa Aroni</option>
                </select>
                <input type="number" name="largeSacks" placeholder="L. Sacks" value={client.largeSacks} onChange={(e) => handleClientChange(index, e)} min="0" />
                <input type="number" name="smallSacks" placeholder="S. Sacks" value={client.smallSacks} onChange={(e) => handleClientChange(index, e)} min="0" />
                <input type="number" name="advance" placeholder="Advance" value={client.advance} onChange={(e) => handleClientChange(index, e)} min="0" />
                <div className="checkbox-group">
                  <input type="checkbox" name="includeUnpacking" checked={client.includeUnpacking} onChange={(e) => handleClientChange(index, e)} id={`unpacking-${index}`} />
                  <label htmlFor={`unpacking-${index}`}>Unpacking</label>
                </div>
              </div>
              {clients.length > 1 && (
                <button type="button" onClick={() => removeClientField(index)} className="remove-client-btn">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addClientField} className="add-client-btn">+ Add Another Client</button>
        </div>

        <div className="form-section">
          <button type="submit" className="save-trip-btn">Save Trip</button>
        </div>
      </form>
    </div>
  );
}

export default AddTripPage;
