// src/pages/TripDetailsPage.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './TripDetailsPage.css';
// === IYI NI YO MPINDURKA Y'INGENZI ===
import API_URL from '../apiConfig'; // Twakuyeho URL ya localhost

const PRICING = {
  PER_LARGE_SACK: 23000,
  PER_SMALL_SACK: 4600,
  UNPACKING_FEE_LARGE: 300,
  UNPACKING_FEE_SMALL: 50,
};

function TripSummary({ trip } ) {
  let totalExpected = 0, totalCollected = 0, totalAdvance = 0;
  trip.manifest.forEach(client => {
    if (client.destination !== 'Goma') {
      const sacksCost = (client.largeSacks * PRICING.PER_LARGE_SACK) + (client.smallSacks * PRICING.PER_SMALL_SACK);
      const unpackingCost = client.includeUnpacking ? (client.largeSacks * PRICING.UNPACKING_FEE_LARGE) + (client.smallSacks * PRICING.UNPACKING_FEE_SMALL) : 0;
      totalExpected += sacksCost + unpackingCost + client.advance;
      totalAdvance += client.advance;
    }
    if (client.payments) { totalCollected += client.payments.reduce((sum, p) => sum + p.amount, 0); }
  });
  const outstanding = totalExpected - totalCollected;
  return (
    <div className="summary-grid">
      <div className="summary-card"><h4>Expected Revenue</h4><p>{totalExpected.toLocaleString()} Rwf</p></div>
      <div className="summary-card"><h4>Total Collected</h4><p className="collected">{totalCollected.toLocaleString()} Rwf</p></div>
      <div className="summary-card"><h4>Total Advance</h4><p>{totalAdvance.toLocaleString()} Rwf</p></div>
      <div className="summary-card"><h4>Outstanding Balance</h4><p className="outstanding">{outstanding.toLocaleString()} Rwf</p></div>
    </div>
  );
}
function DestinationBreakdown({ trip }) {
    const destinations = { 'Rusizi': [], 'Kwa Rehema': [], 'Kwa Aroni': [], 'Goma': [] };
    trip.manifest.forEach(client => { if(destinations[client.destination] !== undefined) { destinations[client.destination].push(client); } });
    return (
        <div>
            {Object.entries(destinations).map(([dest, clients]) => {
                if (clients.length === 0) return null;
                const totals = { largeSacks: clients.reduce((sum, c) => sum + c.largeSacks, 0), smallSacks: clients.reduce((sum, c) => sum + c.smallSacks, 0), totalDue: 0, totalPaid: 0, totalBalance: 0, };
                clients.forEach(c => {
                    const sacksCost = (c.largeSacks * PRICING.PER_LARGE_SACK) + (c.smallSacks * PRICING.PER_SMALL_SACK);
                    const unpackingCost = c.includeUnpacking ? (c.largeSacks * PRICING.UNPACKING_FEE_LARGE) + (c.smallSacks * PRICING.UNPACKING_FEE_SMALL) : 0;
                    const due = sacksCost + unpackingCost + c.advance;
                    const paid = c.payments ? c.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
                    if (dest !== 'Goma') { totals.totalDue += due; totals.totalPaid += paid; totals.totalBalance += (due - paid); }
                });
                return (
                    <div key={dest} className="destination-section">
                        <h4>{dest} ({clients.length} clients)</h4>
                        <table className="summary-table">
                            <thead><tr><th>Client</th><th>L.Sacks</th><th>S.Sacks</th><th>Total Due</th><th>Paid</th><th>Balance</th></tr></thead>
                            <tbody>
                                {clients.map(c => {
                                    const sacksCost = (c.largeSacks * PRICING.PER_LARGE_SACK) + (c.smallSacks * PRICING.PER_SMALL_SACK);
                                    const unpackingCost = c.includeUnpacking ? (c.largeSacks * PRICING.UNPACKING_FEE_LARGE) + (c.smallSacks * PRICING.UNPACKING_FEE_SMALL) : 0;
                                    const totalDue = sacksCost + unpackingCost + c.advance;
                                    const totalPaid = c.payments ? c.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
                                    const balance = totalDue - totalPaid;
                                    return (<tr key={c.id}><td>{c.name}</td><td>{c.largeSacks}</td><td>{c.smallSacks}</td><td>{dest === 'Goma' ? 'N/A' : totalDue.toLocaleString()}</td><td>{totalPaid.toLocaleString()}</td><td className={balance > 0 ? 'outstanding' : 'collected'}>{dest === 'Goma' ? 'N/A' : balance.toLocaleString()}</td></tr>)
                                })}
                                <tr className="total-row"><td><strong>TOTAL</strong></td><td><strong>{totals.largeSacks}</strong></td><td><strong>{totals.smallSacks}</strong></td><td><strong>{dest === 'Goma' ? 'N/A' : totals.totalDue.toLocaleString()}</strong></td><td><strong>{totals.totalPaid.toLocaleString()}</strong></td><td className={totals.totalBalance > 0 ? 'outstanding' : 'collected'}><strong>{dest === 'Goma' ? 'N/A' : totals.totalBalance.toLocaleString()}</strong></td></tr>
                            </tbody>
                        </table>
                    </div>
                )
            })}
        </div>
    );
}
function CollectionSummary({ trip }) {
    const collections = {};
    trip.manifest.forEach(client => {
        if (client.payments && client.payments.length > 0) {
            const destination = client.destination;
            client.payments.forEach(p => {
                const collector = p.collected_by;
                if (!collections[collector]) { collections[collector] = {}; }
                if (!collections[collector][destination]) { collections[collector][destination] = 0; }
                collections[collector][destination] += p.amount;
            });
        }
    });
    return (
        <table className="summary-table">
            <thead><tr><th>Collector</th><th>Destination</th><th>Amount Collected</th></tr></thead>
            <tbody>
                {Object.keys(collections).length === 0 ? (<tr><td colSpan="3">No payments collected for this trip yet.</td></tr>) : (
                    Object.entries(collections).map(([collector, dests]) => {
                        const totalForCollector = Object.values(dests).reduce((sum, amount) => sum + amount, 0);
                        const destEntries = Object.entries(dests);
                        return (
                            <React.Fragment key={collector}>
                                {destEntries.map(([destination, amount], index) => (<tr key={`${collector}-${destination}`}>{index === 0 && (<td rowSpan={destEntries.length} className="collector-cell">{collector}</td>)}<td>{destination}</td><td>{amount.toLocaleString()} Rwf</td></tr>))}
                                <tr className="collector-total-row"><td colSpan="2"><strong>Total for {collector}</strong></td><td><strong>{totalForCollector.toLocaleString()} Rwf</strong></td></tr>
                            </React.Fragment>
                        );
                    })
                )}
            </tbody>
        </table>
    );
}


function TripDetailsPage({ tripId, onBack }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef();

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
    pdf.save(`trip-report-${trip.date}.pdf`);
    setIsPrinting(false);
  };

  useEffect(() => {
    const fetchTripDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/historical-trips/${tripId}`);
        setTrip(response.data.trip);
      } catch (err) {
        setError("Could not load trip details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId]);

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!trip) return <p>No trip data found.</p>;

  return (
    <div className="trip-details-container">
      <div className="page-actions">
        <button onClick={onBack} className="back-btn">&larr; Back to Reports</button>
        <button onClick={handleDownloadPdf} className="print-btn" disabled={isPrinting}>
          {isPrinting ? 'Generating PDF...' : 'Sohora PDF'}
        </button>
      </div>
      
      <div ref={printRef}>
        <div className="details-header">
          <h1>Trip Report: {trip.date}</h1>
          <p><strong>Load Master:</strong> {trip.loadMaster} | <strong>Vehicle:</strong> {trip.plate || 'N/A'}</p>
        </div>
        <div className="details-section">
          <h2>Trip Summary</h2>
          <TripSummary trip={trip} />
        </div>
        <div className="details-section">
          <h2>Destination Breakdown</h2>
          <DestinationBreakdown trip={trip} />
        </div>
        <div className="details-section">
          <h2>Collection Summary</h2>
          <CollectionSummary trip={trip} />
        </div>
      </div>
    </div>
  );
}

export default TripDetailsPage;
