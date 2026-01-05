// src/pages/CollectorLedgerPage.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './CollectorLedgerPage.css';
// === IYI NI YO MPINDURKA Y'INGENZI ===
import API_URL from '../apiConfig'; // Twakuyeho URL ya localhost

function CollectorLedgerPage( ) {
  const [ledgerData, setLedgerData] = useState({ collections: [], expenses: [] });
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    const fetchLedgerData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/ledger-data`);
        const data = response.data;
        
        data.collections = data.collections || [];
        data.expenses = data.expenses || [];
        
        setLedgerData(data);
        
        const uniqueCollectors = ['all', ...new Set([
          ...data.collections.map(c => c.collected_by),
          ...data.expenses.map(e => e.recorded_by)
        ])];
        setCollectors(uniqueCollectors);

      } catch (err) {
        setError('Could not load ledger data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLedgerData();
  }, []);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;
    setIsPrinting(true);
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`collector-ledger-${selectedCollector}.pdf`);
    setIsPrinting(false);
  };

  const filteredCollections = selectedCollector === 'all'
    ? ledgerData.collections
    : ledgerData.collections.filter(c => c.collected_by === selectedCollector);

  const filteredExpenses = selectedCollector === 'all'
    ? ledgerData.expenses
    : ledgerData.expenses.filter(e => e.recorded_by === selectedCollector);

  const totalCollected = filteredCollections.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const finalBalance = totalCollected - totalSpent;

  if (loading) return <p>Loading ledger...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="collector-ledger-container">
      <div className="page-header-controls">
        <h3>Collector Ledger</h3>
        <div className="controls-wrapper">
            <div className="filter-control">
                <label htmlFor="collector-select">Select Collector:</label>
                <select id="collector-select" value={selectedCollector} onChange={e => setSelectedCollector(e.target.value)}>
                    {collectors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <button onClick={handleDownloadPdf} className="print-btn" disabled={isPrinting}>
                {isPrinting ? 'Generating...' : 'Sohora PDF'}
            </button>
        </div>
      </div>

      <div ref={printRef}>
        <div className="details-header">
            <h1>Ledger for: {selectedCollector.toUpperCase()}</h1>
            <p>Report generated on: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="summary-grid">
            <div className="summary-card"><h4>Total Collected</h4><p className="collected">{totalCollected.toLocaleString()} Rwf</p></div>
            <div className="summary-card"><h4>Total Spent</h4><p className="outstanding">{totalSpent.toLocaleString()} Rwf</p></div>
            <div className="summary-card"><h4>Final Balance</h4><p>{finalBalance.toLocaleString()} Rwf</p></div>
        </div>

        <div className="ledger-section">
            <h4>Collections</h4>
            <div className="table-responsive">
                <table className="ledger-table">
                    <thead><tr><th>Date</th><th>Client</th><th>Destination</th><th>Amount</th></tr></thead>
                    <tbody>
                        {filteredCollections.length > 0 ? filteredCollections.map(c => (
                            <tr key={c.payment_id}><td>{new Date(c.date).toLocaleDateString()}</td><td>{c.client_name}</td><td>{c.destination}</td><td>{c.amount.toLocaleString()}</td></tr>
                        )) : <tr><td colSpan="4">No collections found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="ledger-section">
            <h4>Expenses</h4>
            <div className="table-responsive">
                <table className="ledger-table">
                    <thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
                    <tbody>
                        {filteredExpenses.length > 0 ? filteredExpenses.map(e => (
                            <tr key={e.id}><td>{new Date(e.date).toLocaleDateString()}</td><td>{e.description}</td><td>{e.amount.toLocaleString()}</td></tr>
                        )) : <tr><td colSpan="3">No expenses found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CollectorLedgerPage;
