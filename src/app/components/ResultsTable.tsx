'use client';

import React, { FC } from 'react';

interface ResultsTableProps {
  results: {
    countries: Array<{
      code: string;
      grossIncome: number;
      netIncome: number;
      incomeTax: number;
      socialSecurity: number;
      taxRate: number;
    }>;
  };
  viewMode: string;
  currency: string;
}

const ResultsTable: FC<ResultsTableProps> = ({ results, viewMode, currency }) => {
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': return '$';
      default: return '€';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <table id="results-table">
      <thead>
        <tr>
          <th>Country</th>
          <th>Gross Income</th>
          <th>Net Income</th>
          {viewMode === 'detailed' && (
            <>
              <th>Income Tax</th>
              <th>Social Security</th>
            </>
          )}
          <th>Tax Rate</th>
        </tr>
      </thead>
      <tbody>
        {results.countries.map(country => (
          <tr key={country.code}>
            <td>{country.code.toUpperCase()}</td>
            <td>{formatCurrency(country.grossIncome)}</td>
            <td>{formatCurrency(country.netIncome)}</td>
            {viewMode === 'detailed' && (
              <>
                <td>{formatCurrency(country.incomeTax)}</td>
                <td>{formatCurrency(country.socialSecurity)}</td>
              </>
            )}
            <td>{formatPercentage(country.taxRate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultsTable; 