'use client';

import React, { FC, useState } from 'react';

// Define tax benefits for each country
const taxBenefits = {
  pt: [
    { id: "nhrStatus", label: "NHR Status (20% flat tax rate)", type: "checkbox" },
    { id: "ifici", label: "IFICI Tax Benefit (20% flat tax rate)", type: "checkbox" }
  ],
  es: [
    { id: "beckhamLaw", label: "Beckham Law (24% flat tax rate)", type: "checkbox" }
  ],
  fr: [
    { id: "impatriateRegime", label: "Impatriate Regime (30% tax exemption)", type: "checkbox" }
  ],
  uk: [
    { id: "nonDomStatus", label: "Non-Dom Status", type: "checkbox" }
  ],
  cy: [
    { id: "nonDomStatus", label: "Non-Dom Status", type: "checkbox" },
    { id: "expatRegime", label: "Expat Regime (50% exemption)", type: "checkbox" }
  ]
};

interface TaxBenefitsProps {
  selectedCountries: string[];
}

const TaxBenefits: FC<TaxBenefitsProps> = ({ selectedCountries }) => {
  const [benefitValues, setBenefitValues] = useState<Record<string, Record<string, boolean>>>({});

  const handleBenefitChange = (country: string, benefitId: string, checked: boolean) => {
    setBenefitValues(prev => ({
      ...prev,
      [country]: {
        ...(prev[country] || {}),
        [benefitId]: checked
      }
    }));
  };

  return (
    <div id="tax-benefits-container">
      {selectedCountries.map(country => {
        const countryBenefits = taxBenefits[country as keyof typeof taxBenefits];
        if (!countryBenefits || countryBenefits.length === 0) return null;
        
        return (
          <div key={country} className="country-benefits">
            <h3>{country.toUpperCase()} Tax Benefits</h3>
            {countryBenefits.map(benefit => (
              <div key={`${country}-${benefit.id}`} className="question">
                <label htmlFor={`${country}-${benefit.id}`}>
                  <input
                    type="checkbox"
                    id={`${country}-${benefit.id}`}
                    checked={benefitValues[country]?.[benefit.id] || false}
                    onChange={(e) => handleBenefitChange(country, benefit.id, e.target.checked)}
                  />
                  {benefit.label}
                </label>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default TaxBenefits; 