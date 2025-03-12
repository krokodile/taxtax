'use client';

import React, { useState, useEffect } from 'react';
import CountrySelector from './CountrySelector';
import IncomeTypes from './IncomeTypes';
import TaxBenefits from './TaxBenefits';
import Questions from './Questions';
import ResultsTable from './ResultsTable';

const TaxCalculator = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [currency, setCurrency] = useState<string>('EUR');
  const [results, setResults] = useState<any>(null);
  const [viewMode, setViewMode] = useState<string>('detailed');

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const handleCalculate = () => {
    // This will be implemented later with actual tax calculations
    const mockResults = {
      countries: selectedCountries.map(country => ({
        code: country,
        grossIncome: 100000,
        netIncome: 70000,
        incomeTax: 20000,
        socialSecurity: 10000,
        taxRate: 30,
      })),
    };
    
    setResults(mockResults);
  };

  const handleViewModeToggle = () => {
    setViewMode(prev => prev === 'detailed' ? 'simple' : 'detailed');
  };

  const handleReset = () => {
    // Reset form data
    setResults(null);
  };

  const handleShare = () => {
    // Implement sharing functionality
    alert('Sharing functionality will be implemented later');
  };

  return (
    <div>
      <div className="header-container">
        <div className="header-left">
          <h1>Tax Calculator</h1>
        </div>
        <div className="header-right">
          <div className="currency-selector">
            <div className="segmented-control currency-control">
              <button 
                type="button" 
                value="EUR" 
                className={currency === 'EUR' ? 'active' : ''}
                onClick={() => handleCurrencyChange('EUR')}
              >
                € EUR
              </button>
              <button 
                type="button" 
                value="GBP" 
                className={currency === 'GBP' ? 'active' : ''}
                onClick={() => handleCurrencyChange('GBP')}
              >
                £ GBP
              </button>
              <button 
                type="button" 
                value="USD" 
                className={currency === 'USD' ? 'active' : ''}
                onClick={() => handleCurrencyChange('USD')}
              >
                $ USD
              </button>
            </div>
          </div>
          <button onClick={() => alert('Fill test data')} className="btn">🐛 Fill Test Data</button>
          <button onClick={handleReset} className="btn">🔄 Reset Data</button>
        </div>
      </div>

      <div className="card">
        <div className="header-with-selector">
          <h2>I want plan my taxes in:</h2>
          <CountrySelector 
            selectedCountries={selectedCountries} 
            onToggle={handleCountryToggle} 
          />
        </div>
      </div>

      {selectedCountries.length > 0 && (
        <div className="card">
          <IncomeTypes 
            selectedCountries={selectedCountries} 
            currency={currency} 
          />
          
          <h2 id="tax-benefits-header" className="section-header">Tax Benefits you may like</h2>
          <TaxBenefits 
            selectedCountries={selectedCountries} 
          />
          
          <h2 id="questions-header" className="section-header">Such much important questions</h2>
          <Questions 
            selectedCountries={selectedCountries} 
          />
        
          <button id="calculate-button" className="btn btn-primary" onClick={handleCalculate}>
            Calculate Taxes
          </button>
        </div>
      )}

      {results && (
        <div className="card">
          <div className="results-header">
            <h2>Results</h2>
            <div className="view-toggle">
              <label className="switch">
                <input 
                  type="checkbox" 
                  id="view-mode-toggle" 
                  checked={viewMode === 'detailed'} 
                  onChange={handleViewModeToggle}
                />
                <span className="slider round"></span>
              </label>
              <span id="view-mode-label">{viewMode === 'detailed' ? 'Detailed View' : 'Simple View'}</span>
            </div>
            <button id="share-button" className="btn" onClick={handleShare}>🔗 Share</button>
          </div>
          <ResultsTable 
            results={results} 
            viewMode={viewMode} 
            currency={currency} 
          />
        </div>
      )}
    </div>
  );
};

export default TaxCalculator; 