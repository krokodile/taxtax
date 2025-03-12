'use client';

import React, { FC, useState } from 'react';

// Define income types
const incomeTypes = {
  employment: { label: 'Employment Income', disabled: false },
  soleProprietorship: { label: 'Self-employed', disabled: false },
  rental: { label: 'Rental Income', disabled: false },
  capitalGains: { label: 'Capital Gains', disabled: false },
  pension: { label: 'Pension Income', disabled: false }
};

interface IncomeTypesProps {
  selectedCountries: string[];
  currency: string;
}

const IncomeTypes: FC<IncomeTypesProps> = ({ selectedCountries, currency }) => {
  const [incomeValues, setIncomeValues] = useState<Record<string, Record<string, number>>>({});

  const handleIncomeChange = (country: string, type: string, value: number) => {
    setIncomeValues(prev => ({
      ...prev,
      [country]: {
        ...(prev[country] || {}),
        [type]: value
      }
    }));
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': return '$';
      default: return '€';
    }
  };

  return (
    <div id="income-types">
      <table className="income-types-table">
        <thead>
          <tr>
            <th>Income Type</th>
            {selectedCountries.map(country => (
              <th key={country}>{country.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(incomeTypes).map(([type, { label, disabled }]) => (
            <tr key={type}>
              <td>{label}</td>
              {selectedCountries.map(country => (
                <td key={`${country}-${type}`}>
                  <div className="income-input">
                    <span className="currency-symbol">{getCurrencySymbol(currency)}</span>
                    <input
                      type="number"
                      id={`${country}-amount-${type}`}
                      value={incomeValues[country]?.[type] || ''}
                      onChange={(e) => handleIncomeChange(country, type, Number(e.target.value))}
                      disabled={disabled}
                      min="0"
                      step="1000"
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeTypes; 