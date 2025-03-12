'use client';

import React, { useState, useEffect } from 'react';
import TaxCalculator from './components/TaxCalculator';

export default function Home() {
  return (
    <main className="container">
      <TaxCalculator />
    </main>
  );
} 