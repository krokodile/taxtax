'use client';

import React, { FC } from 'react';

// Define country data
const countries = [
  { code: 'pt', name: 'Portugal' },
  { code: 'es', name: 'Spain' },
  { code: 'fr', name: 'France' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'cy', name: 'Cyprus' },
];

interface CountrySelectorProps {
  selectedCountries: string[];
  onToggle: (countryCode: string) => void;
}

const CountrySelector: FC<CountrySelectorProps> = ({ selectedCountries, onToggle }) => {
  return (
    <div id="country-selects" className="country-selector">
      {countries.map(country => (
        <button
          key={country.code}
          type="button"
          className={selectedCountries.includes(country.code) ? 'active' : ''}
          onClick={() => onToggle(country.code)}
        >
          {country.name}
        </button>
      ))}
    </div>
  );
};

export default CountrySelector; 