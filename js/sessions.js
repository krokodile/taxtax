// State management functions
export function getAppState(selectedCountries, selectedCurrency) {
    const state = {
        selectedCountries: [...selectedCountries], // Create a copy of the array
        selectedCurrency,
        incomeTypes: {},
        questions: {},
        taxBenefits: {},
        results: null
    };

    // Get income types state
    document.querySelectorAll('input[type="checkbox"][id^="income-"]').forEach(checkbox => {
        const incomeType = checkbox.dataset.incomeType;
        const amountInput = document.getElementById(`amount-${incomeType}`);
        state.incomeTypes[incomeType] = {
            checked: checkbox.checked,
            amount: amountInput ? amountInput.value : '0'
        };

        // Add special fields for sole proprietorship
        if (incomeType === 'soleProprietorship') {
            const yearsInput = document.getElementById('yearsInBusiness');
            const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
            if (yearsInput) {
                state.incomeTypes.yearsInBusiness = yearsInput.value;
            }
            if (regimeControl) {
                const activeButton = regimeControl.querySelector('button.active');
                state.incomeTypes.regime = activeButton ? activeButton.value : 'Simplified Regime';
            }
        }
    });

    // Get questions state
    document.querySelectorAll('.question input, .question select, .question .segmented-control').forEach(element => {
        if (element.classList.contains('segmented-control')) {
            const activeButton = element.querySelector('button.active');
            state.questions[element.id] = activeButton ? activeButton.value : null;
        } else {
            state.questions[element.id] = element.type === 'checkbox' ? element.checked : element.value;
        }
    });

    // Get tax benefits state
    document.querySelectorAll('#tax-benefits-container input[type="checkbox"]').forEach(checkbox => {
        state.taxBenefits[checkbox.id] = checkbox.checked;
    });

    // Get results table state if it exists
    const resultsTable = document.getElementById('results-table');
    if (resultsTable && resultsTable.rows.length > 1) {
        state.results = {
            headers: Array.from(resultsTable.querySelectorAll('thead th')).map(th => th.textContent),
            rows: Array.from(resultsTable.querySelectorAll('tbody tr')).map(row => 
                Array.from(row.cells).map(cell => cell.textContent)
            )
        };
    }

    return state;
}

export function saveState(selectedCountries, selectedCurrency) {
    const state = getAppState(selectedCountries, selectedCurrency);
    localStorage.setItem('taxCalculatorState', JSON.stringify(state));
    updateURL(state);
}

export function updateURL(state) {
    const params = new URLSearchParams();
    
    // Add selected countries
    if (state.selectedCountries.length) {
        params.set('countries', state.selectedCountries.join(','));
    }
    
    // Add currency
    params.set('currency', state.selectedCurrency);
    
    // Add income types
    Object.entries(state.incomeTypes).forEach(([type, data]) => {
        if (data.checked) {
            params.set(`income_${type}`, data.amount);
        }
    });
    
    // Add special sole proprietorship fields
    if (state.incomeTypes.yearsInBusiness) {
        params.set('years_in_business', state.incomeTypes.yearsInBusiness);
    }
    if (state.incomeTypes.regime) {
        params.set('regime', state.incomeTypes.regime);
    }
    
    // Add tax benefits
    Object.entries(state.taxBenefits).forEach(([id, checked]) => {
        if (checked) {
            params.set(`benefit_${id}`, '1');
        }
    });
    
    // Add questions
    Object.entries(state.questions).forEach(([id, value]) => {
        if (value !== null && value !== '') {
            params.set(`q_${id}`, value);
        }
    });
    
    // Update URL without reloading the page
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newURL }, '', newURL);
}

export function restoreState(state, config) {
    const { 
        selectedCountries, 
        updateCountrySelects, 
        renderTaxBenefits, 
        renderQuestions, 
        renderIncomeTypes 
    } = config;

    // Restore selected countries
    if (state.selectedCountries && state.selectedCountries.length) {
        selectedCountries.length = 0; // Clear array
        selectedCountries.push(...state.selectedCountries);
        updateCountrySelects({ selectedCountries });
    }
    
    // Restore currency
    if (state.selectedCurrency) {
        config.selectedCurrency = state.selectedCurrency;
        document.querySelectorAll('.currency-control button').forEach(button => {
            button.classList.toggle('active', button.value === state.selectedCurrency);
        });
    }
    
    // Restore income types
    Object.entries(state.incomeTypes).forEach(([type, data]) => {
        const checkbox = document.querySelector(`input[type="checkbox"][id="income-${type}"]`);
        const amountInput = document.getElementById(`amount-${type}`);
        
        if (checkbox && data.checked) {
            checkbox.checked = true;
            if (amountInput) {
                amountInput.value = data.amount;
                amountInput.disabled = false;
                amountInput.parentElement.style.visibility = 'visible';
            }
        }
    });
    
    // Restore special sole proprietorship fields
    if (state.incomeTypes.yearsInBusiness) {
        const yearsInput = document.getElementById('yearsInBusiness');
        if (yearsInput) {
            yearsInput.value = state.incomeTypes.yearsInBusiness;
        }
    }
    if (state.incomeTypes.regime) {
        const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
        if (regimeControl) {
            regimeControl.querySelectorAll('button').forEach(button => {
                button.classList.toggle('active', button.value === state.incomeTypes.regime);
            });
        }
    }
    
    // Restore questions
    Object.entries(state.questions).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.classList.contains('segmented-control')) {
                element.querySelectorAll('button').forEach(button => {
                    button.classList.toggle('active', button.value === value);
                });
            } else if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
    
    // Restore tax benefits
    Object.entries(state.taxBenefits).forEach(([id, checked]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = checked;
        }
    });
    
    // Restore results table if exists
    if (state.results) {
        const resultsTable = document.getElementById('results-table');
        if (resultsTable) {
            // Clear existing table
            resultsTable.querySelector('thead').innerHTML = '';
            resultsTable.querySelector('tbody').innerHTML = '';
            
            // Restore headers
            const headerRow = document.createElement('tr');
            state.results.headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            resultsTable.querySelector('thead').appendChild(headerRow);
            
            // Restore rows
            state.results.rows.forEach(rowData => {
                const row = document.createElement('tr');
                rowData.forEach(cellData => {
                    const cell = document.createElement('td');
                    cell.textContent = cellData;
                    row.appendChild(cell);
                });
                resultsTable.querySelector('tbody').appendChild(row);
            });
        }
    }
    
    // Re-render UI components if functions are provided
    if (typeof renderTaxBenefits === 'function') {
        renderTaxBenefits();
    }
    if (typeof renderQuestions === 'function') {
        renderQuestions();
    }
    if (typeof renderIncomeTypes === 'function') {
        renderIncomeTypes();
    }
}

export function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const state = {
        selectedCountries: [],
        selectedCurrency: 'EUR',
        incomeTypes: {},
        questions: {},
        taxBenefits: {},
        results: null
    };
    
    // Parse countries
    const countries = params.get('countries');
    if (countries) {
        state.selectedCountries = countries.split(',');
    }
    
    // Parse currency
    const currency = params.get('currency');
    if (currency) {
        state.selectedCurrency = currency;
    }
    
    // Parse income types
    params.forEach((value, key) => {
        if (key.startsWith('income_')) {
            const type = key.replace('income_', '');
            state.incomeTypes[type] = {
                checked: true,
                amount: value
            };
        }
    });
    
    // Parse special sole proprietorship fields
    const yearsInBusiness = params.get('years_in_business');
    if (yearsInBusiness) {
        state.incomeTypes.yearsInBusiness = yearsInBusiness;
    }
    const regime = params.get('regime');
    if (regime) {
        state.incomeTypes.regime = regime;
    }
    
    // Parse tax benefits
    params.forEach((value, key) => {
        if (key.startsWith('benefit_')) {
            const id = key.replace('benefit_', '');
            state.taxBenefits[id] = value === '1';
        }
    });
    
    // Parse questions
    params.forEach((value, key) => {
        if (key.startsWith('q_')) {
            const id = key.replace('q_', '');
            state.questions[id] = value;
        }
    });
    
    return state;
}

export function setupSessionHandlers(config) {
    const { selectedCountries, selectedCurrency, calculateButton } = config;

    // Add state saving on relevant events
    const saveStateEvents = [
        'change', // For inputs, selects, and checkboxes
        'click'   // For buttons in segmented controls
    ];
    
    saveStateEvents.forEach(eventType => {
        document.addEventListener(eventType, (e) => {
            // Check if the event target is a relevant element
            const isRelevantTarget = 
                e.target.matches('input, select, .segmented-control button') ||
                e.target.closest('.question, #income-types, #tax-benefits-container');
            
            if (isRelevantTarget) {
                saveState(selectedCountries, selectedCurrency);
            }
        });
    });
    
    // Save state when calculate button is clicked
    calculateButton.addEventListener('click', () => saveState(selectedCountries, selectedCurrency));
} 