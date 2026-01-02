// src/pages/AddExpensePage.js
import React, { useState } from 'react';
import axios from 'axios';
import './AddExpensePage.css';
// === IYI NI YO MPINDURKA Y'INGENZI ===
import API_URL from '../apiConfig'; // Twakuyeho URL ya localhost

function AddExpensePage({ user } ) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || !date) {
      setMessage({ type: 'error', content: 'Please fill in all fields.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', content: '' });

    const expenseData = {
      amount: parseFloat(amount),
      description: description,
      date: date,
      recorded_by: user.username,
    };

    try {
      const response = await axios.post(`${API_URL}/expenses`, expenseData);
      setMessage({ type: 'success', content: response.data.message });
      setAmount('');
      setDescription('');
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to save expense.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-expense-container">
      <div className="form-section">
        <h3>Record a New Expense</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Expense Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount (Rwf)</label>
            <input
              type="number"
              id="amount"
              placeholder="e.g., 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="e.g., Fuel for vehicle RAE 200Y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {message.content && (
            <div className={`message ${message.type}`}>{message.content}</div>
          )}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpensePage;
