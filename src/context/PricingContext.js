// src/context/PricingContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../apiConfig'; // Ubu turakoresha apiClient yawe

const PricingContext = createContext();

// Fallback values (agaciro ka mbere gashobora gukoreshwa)
const FALLBACK_PRICING = {
  tripPricePerKg: 100,
  expensePricePerKg: 20,
  paymentPricePerKg: 80,
};

export const usePricing = () => useContext(PricingContext);

export const PricingProvider = ({ children }) => {
  const [pricing, setPricing] = useState(FALLBACK_PRICING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        // Ubu turakoresha apiClient yawe
        const response = await apiClient.get('/settings/pricing'); 
        setPricing(response.data);
      } catch (error) {
        console.error("Failed to fetch pricing, using fallback values:", error);
        setPricing(FALLBACK_PRICING);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  return (
    <PricingContext.Provider value={{ pricing, loading }}>
      {children}
    </PricingContext.Provider>
  );
};
