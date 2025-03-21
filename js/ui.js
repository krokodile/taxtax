// Import utility functions
import { fillTestData, resetData, convertCurrency, updateAmountInputs, formatCurrency } from './utils.js';
import { collectCommonData, calculateTaxes, validateYearsInBusiness, calculateTotalIncome } from './calculations.js';

// UI Functions

export function updateCountrySelects(config) {
    const { countrySelectsContainer, selectedCountries, taxData } = config;
    if (!countrySelectsContainer) return;

    countrySelectsContainer.innerHTML = ''; // Clear previous content

    // Render buttons for each country with flags
    const countries = ['fr', 'es', 'pt', 'uk', 'cy', 'pl'];
    
    countries.forEach(countryCode => {
        const button = document.createElement('button');
        button.dataset.country = countryCode;
        button.onclick = () => toggleCountry(countryCode, selectedCountries, config.renderCallbacks);
        button.innerHTML = `${taxData[countryCode].flag} ${taxData[countryCode].name}`;
        
        // Add active class if country is selected
        if (selectedCountries.includes(countryCode)) {
            button.classList.add('active');
        }
        
        countrySelectsContainer.appendChild(button);
    });
}

export function toggleCountry(countryCode, selectedCountries, renderCallbacks) {
    console.log('Toggling country:', countryCode);
    const index = selectedCountries.indexOf(countryCode);
    const button = document.querySelector(`button[data-country="${countryCode}"]`);
    if (index > -1) {
        selectedCountries.splice(index, 1);
        if (button) {
            button.classList.remove('active');
        }
        console.log('Removed country:', countryCode);
    } else {
        selectedCountries.push(countryCode);
        if (button) {
            button.classList.add('active');
        }
        console.log('Added country:', countryCode);
    }
    console.log('Selected countries:', selectedCountries);

    // Call render callbacks
    if (renderCallbacks) {
        renderCallbacks.renderTaxBenefits();
        renderCallbacks.renderQuestions();
        renderCallbacks.renderIncomeTypes();
    }
    
    // Show or hide questions and tax benefits sections based on selected countries
    const questionsHeader = document.getElementById('questions-header');
    const questionsContainer = document.getElementById('questions-container');
    const taxBenefitsHeader = document.getElementById('tax-benefits-header');
    const taxBenefitsContainer = document.getElementById('tax-benefits-container');
    
    if (selectedCountries.length > 0) {
        // Show sections if countries are selected
        if (questionsHeader) questionsHeader.classList.remove('hidden');
        if (questionsContainer) questionsContainer.classList.remove('hidden');
        if (taxBenefitsHeader) taxBenefitsHeader.classList.remove('hidden');
        if (taxBenefitsContainer) taxBenefitsContainer.classList.remove('hidden');
    } else {
        // Hide sections if no countries are selected
        if (questionsHeader) questionsHeader.classList.add('hidden');
        if (questionsContainer) questionsContainer.classList.add('hidden');
        if (taxBenefitsHeader) taxBenefitsHeader.classList.add('hidden');
        if (taxBenefitsContainer) taxBenefitsContainer.classList.add('hidden');
    }
    
    // Show a message if no countries are selected
    const calculateButton = document.getElementById('calculate-button');
    if (selectedCountries.length === 0) {
        calculateButton.disabled = true;
        calculateButton.style.opacity = '0.5';
    } else {
        calculateButton.disabled = false;
        calculateButton.style.opacity = '1';
    }
}

export function displayResults(results, selectedCountries, taxData, resultsTable, isDetailedView, selectedCurrency) {
    resultsTable.innerHTML = '';

    if (!results) {
        return;
    }

    const headerRow = resultsTable.insertRow();
    headerRow.appendChild(document.createElement('th'));

    selectedCountries.forEach(countryCode => {
        const th = document.createElement('th');
        th.textContent = `${taxData[countryCode].flag} ${taxData[countryCode].name}`;
        th.style.textAlign = 'right';
        headerRow.appendChild(th);
    });

    // Helper function to round to nearest 100
    const roundToNearestHundred = (value) => Math.round(value / 100) * 100;

    // Return the Total Income row (sum of all incomes)
    const totalIncomeRow = resultsTable.insertRow();
    totalIncomeRow.insertCell().textContent = 'Total Income';
    
    // Use the original income value, not the converted taxableBase
    // This ensures the displayed income doesn't change when currency changes
    const totalIncome = calculateTotalIncome(); // Get the actual input value
    
    selectedCountries.forEach(() => { 
        totalIncomeRow.insertCell().textContent = formatCurrency(roundToNearestHundred(totalIncome), selectedCurrency); 
    });

    // Display the taxable base
    const taxableBaseRow = resultsTable.insertRow();
    taxableBaseRow.insertCell().textContent = 'Taxable Base';
    selectedCountries.forEach(countryCode => {
        // For taxable base, we still use the converted value from results
        // as this is calculated differently for each country
        taxableBaseRow.insertCell().textContent = formatCurrency(roundToNearestHundred(results[countryCode].taxableBase), selectedCurrency);
    });

    // Tax regime note and family quotient info - only in detailed view
    if (isDetailedView) {
        const taxRegimeNoteRow = resultsTable.insertRow();
        taxRegimeNoteRow.insertCell().textContent = "Tax Regime Note";
        taxRegimeNoteRow.classList.add('detailed-view-row');
        selectedCountries.forEach(countryCode => {
            const cell = taxRegimeNoteRow.insertCell();
            cell.textContent = results[countryCode].taxRegimeNote || "";
            
            // Add family quotient calculation details for France
            if (countryCode === 'fr' && results[countryCode].familyQuotient) {
                const quotient = results[countryCode].familyQuotient;
                const originalBase = results[countryCode].originalTaxableBase;
                const perPart = originalBase / quotient;
                cell.innerHTML += `<br>Income per part: ${formatCurrency(roundToNearestHundred(perPart), selectedCurrency)}`;
            }
        });
    }

    // Income tax details - only in detailed view
    if (isDetailedView) {
        selectedCountries.forEach(countryCode => {
            results[countryCode].incomeTaxDetails.forEach(detail => {
                const detailRow = resultsTable.insertRow();
                detailRow.insertCell().textContent = `Income Tax (${(detail.rate * 100).toFixed(2)}%)`;
                detailRow.classList.add('detailed-view-row');
                selectedCountries.forEach(innerCountryCode => {
                    if (innerCountryCode === countryCode) {
                        detailRow.insertCell().textContent = `${formatCurrency(roundToNearestHundred(detail.taxableAmount), selectedCurrency)} → ${formatCurrency(roundToNearestHundred(detail.taxAmount), selectedCurrency)}`;
                    } else {
                        detailRow.insertCell().textContent = "";
                    }
                });
            });
        });
    }

    // Total income tax
    const incomeTaxRow = resultsTable.insertRow();
    incomeTaxRow.insertCell().textContent = 'Total Income Tax';
    incomeTaxRow.classList.add('highlight');
    selectedCountries.forEach(countryCode => {
        incomeTaxRow.insertCell().textContent = formatCurrency(roundToNearestHundred(results[countryCode].incomeTax), selectedCurrency);
    });

    // Social security
    const socialSecurityRow = resultsTable.insertRow();
    socialSecurityRow.insertCell().textContent = 'Social Security';
    selectedCountries.forEach(countryCode => {
        socialSecurityRow.insertCell().textContent = formatCurrency(roundToNearestHundred(results[countryCode].socialSecurity), selectedCurrency);
    });

    // Social security note - only in detailed view
    if (isDetailedView) {
        const socialSecurityNoteRow = resultsTable.insertRow();
        socialSecurityNoteRow.insertCell().textContent = 'Social Security Note';
        socialSecurityNoteRow.classList.add('detailed-view-row');
        selectedCountries.forEach(countryCode => {
            socialSecurityNoteRow.insertCell().textContent = results[countryCode].socialSecurityNote;
        });
    }

    // Other taxes
    const otherTaxesRow = resultsTable.insertRow();
    otherTaxesRow.insertCell().textContent = 'Other Taxes';
    selectedCountries.forEach(countryCode => {
        const otherTaxes = results[countryCode].otherTaxes || 0;
        otherTaxesRow.insertCell().textContent = formatCurrency(roundToNearestHundred(otherTaxes), selectedCurrency);
    });

    // Total deductions
    const totalDeductionsRow = resultsTable.insertRow();
    totalDeductionsRow.insertCell().textContent = 'Total Deductions';
    totalDeductionsRow.classList.add('highlight');
    selectedCountries.forEach(countryCode => {
        totalDeductionsRow.insertCell().textContent = formatCurrency(roundToNearestHundred(results[countryCode].totalDeductions), selectedCurrency);
    });

    // Net income
    const netIncomeRow = resultsTable.insertRow();
    netIncomeRow.insertCell().textContent = 'Net Income';
    netIncomeRow.classList.add('highlight');
    selectedCountries.forEach(countryCode => {
        netIncomeRow.insertCell().textContent = formatCurrency(roundToNearestHundred(results[countryCode].netIncome), selectedCurrency);
    });

    // Effective tax rate
    const effectiveTaxRateRow = resultsTable.insertRow();
    effectiveTaxRateRow.insertCell().textContent = 'Effective Tax Rate';
    effectiveTaxRateRow.classList.add('highlight');
    selectedCountries.forEach(countryCode => {
        effectiveTaxRateRow.insertCell().textContent = results[countryCode].effectiveTaxRate + " %";
    });
    
    // Scroll to results
    document.querySelector('.card:last-child').scrollIntoView({ behavior: 'smooth' });
}

export function setupEventListeners(config) {
    const {
        countrySelectsContainer,
        questionsContainer,
        calculateButton,
        resultsTable,
        selectedCountries,
        totalIncome,
        taxData,
        renderCallbacks
    } = config;

    // Add currency selector event listeners
    const currencyButtons = document.querySelectorAll('.currency-control button');
    currencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const oldCurrency = config.selectedCurrency;
            const newCurrency = button.value;
            
            // Update active button
            currencyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update selected currency
            config.selectedCurrency = newCurrency;
            
            // Update currency symbols next to amount inputs (without changing values)
            updateAmountInputs(oldCurrency, newCurrency);
            
            // If there are selected countries, recalculate taxes with the new currency
            if (selectedCountries.length > 0) {
                // Trigger calculation button click
                calculateButton.click();
            }
        });
    });
    
    // Add event listener for share button
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', () => {
            import('./utils.js').then(utils => {
                utils.copyStateURLToClipboard({
                    selectedCountries,
                    totalIncome,
                    resultsTable,
                    ...renderCallbacks
                });
            });
        });
    }
    
    // Add event listener for fill test data button
    const fillTestDataButton = document.getElementById('fill-test-data');
    if (fillTestDataButton) {
        fillTestDataButton.addEventListener('click', () => {
            // First reset data to ensure a clean state
            resetData({
                selectedCountries,
                totalIncome,
                resultsTable,
                toggleCountry: (code) => toggleCountry(code, selectedCountries, renderCallbacks),
                ...renderCallbacks
            });
            
            // Then fill with test data
            fillTestData({
                selectedCountries,
                totalIncome,
                resultsTable,
                toggleCountry: (code) => toggleCountry(code, selectedCountries, renderCallbacks),
                ...renderCallbacks
            });
        });
    }
    
    // Add event listener for reset data button
    const resetDataButton = document.getElementById('reset-data');
    if (resetDataButton) {
        resetDataButton.addEventListener('click', () => {
            resetData({
                selectedCountries,
                totalIncome,
                resultsTable,
                toggleCountry: (code) => toggleCountry(code, selectedCountries, renderCallbacks),
                ...renderCallbacks
            });
            
            // Hide questions and results sections
            const questionsHeader = document.getElementById('questions-header');
            const questionsContainer = document.getElementById('questions-container');
            const taxBenefitsHeader = document.getElementById('tax-benefits-header');
            const taxBenefitsContainer = document.getElementById('tax-benefits-container');
            
            if (questionsHeader) questionsHeader.classList.add('hidden');
            if (questionsContainer) questionsContainer.classList.add('hidden');
            if (taxBenefitsHeader) taxBenefitsHeader.classList.add('hidden');
            if (taxBenefitsContainer) taxBenefitsContainer.classList.add('hidden');
            
            // Clear results table
            if (resultsTable) {
                resultsTable.innerHTML = '';
            }
            
            // Reset URL to remove all parameters
            const cleanURL = window.location.protocol + '//' + window.location.host + window.location.pathname;
            window.history.pushState({}, '', cleanURL);
        });
    }
    
    // Add event listener for view mode toggle
    const viewModeToggle = document.getElementById('view-mode-toggle');
    const viewModeLabel = document.getElementById('view-mode-label');
    
    
    if (viewModeToggle && viewModeLabel) {
        viewModeToggle.addEventListener('change', function() {
            const isDetailedView = this.checked;
            viewModeLabel.textContent = isDetailedView ? 'Detailed View' : 'Simple View';
            
            // Update the isDetailedView in the config
            config.isDetailedView = isDetailedView;
            
            const existingResults = resultsTable.querySelector('tbody');
            if (existingResults && existingResults.children.length > 0) {
                const results = calculateTaxes(selectedCountries);
                if (results) {
                    displayResults(results, selectedCountries, taxData, resultsTable, isDetailedView, config.selectedCurrency);
                }
            }
        });
    }

    // Set up calculate button event listener
    if (calculateButton) {
        calculateButton.addEventListener('click', () => {
            console.log('Calculate button clicked');
            const commonData = collectCommonData();
            if (validateYearsInBusiness(commonData.hasSoleProprietorship, selectedCountries, commonData.yearsInBusiness)) {
                console.log('Years in business validated');
                const results = calculateTaxes(selectedCountries);
                console.log('Calculation results:', results);
                if (results) {
                    displayResults(results, selectedCountries, taxData, resultsTable, config.isDetailedView, config.selectedCurrency);
                    console.log('Results displayed');
                    
                    // Update URL with current state
                    import('./utils.js').then(utils => {
                        const stateUrl = utils.saveStateToURL({
                            selectedCountries,
                            totalIncome,
                            resultsTable,
                            isDetailedView: config.isDetailedView
                        });
                        // Update browser URL without reloading the page
                        window.history.pushState({}, '', stateUrl);
                        console.log('URL updated with current state');
                    });
                }
            }
        });
    }
}

export function parseURLParams(config) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // If there are URL parameters, restore state from them
    if (urlParams.toString()) {
        // Import the restoreStateFromURL function
        import('./utils.js').then(utils => {
            // Create a proper config object with toggleCountry function
            const fullConfig = {
                ...config,
                toggleCountry: (code) => toggleCountry(code, config.selectedCountries, config.renderCallbacks)
            };
            utils.restoreStateFromURL(fullConfig);
        });
    } else {
        // If fillTestData parameter is present, fill with test data
        if (urlParams.has('fillTestData') && urlParams.get('fillTestData') === 'true') {
            console.log('Filling test data from URL parameter');
            const context = {
                selectedCountries: config.selectedCountries,
                totalIncome: config.totalIncome,
                resultsTable: config.resultsTable,
                toggleCountry: (code) => toggleCountry(code, config.selectedCountries, config.renderCallbacks),
                ...config.renderCallbacks
            };
            fillTestData(context);
        }
        
        // If showResults or calculate parameter is present, calculate taxes (for backward compatibility)
        if ((urlParams.has('showResults') && urlParams.get('showResults') === 'true') || 
            (urlParams.has('calculate') && urlParams.get('calculate') === 'true')) {
            console.log('Calculating taxes from URL parameter');
            setTimeout(() => {
                config.calculateButton.click();
            }, 500);
        }
        
        // If view parameter is present, set view mode
        if (urlParams.has('view')) {
            const viewMode = urlParams.get('view');
            const viewModeToggle = document.getElementById('view-mode-toggle');
            const viewModeLabel = document.getElementById('view-mode-label');
            
            if (viewMode === 'detailed') {
                viewModeToggle.checked = true;
                config.isDetailedView = true;
                if (viewModeLabel) viewModeLabel.textContent = 'Detailed View';
            } else if (viewMode === 'simple') {
                viewModeToggle.checked = false;
                config.isDetailedView = false;
                if (viewModeLabel) viewModeLabel.textContent = 'Simple View';
            }
        }
    }
} 