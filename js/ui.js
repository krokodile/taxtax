// Import utility functions
import { fillTestData, resetData } from './utils.js';
import { collectCommonData, calculateTaxes, validateYearsInBusiness, calculateTotalIncome } from './calculations.js';

// UI Functions

export function updateCountrySelects(config) {
    const { countrySelectsContainer, selectedCountries, taxData } = config;
    if (!countrySelectsContainer) return;

    countrySelectsContainer.innerHTML = ''; // Clear previous content

    // Render buttons for each country with flags
    const countries = ['fr', 'es', 'pt', 'uk', 'cy'];
    
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

export function displayResults(results, selectedCountries, taxData, resultsTable, isDetailedView) {
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
    const totalIncome = results[selectedCountries[0]].taxableBase; // Use the first country's taxable base as total income
    selectedCountries.forEach(() => { 
        totalIncomeRow.insertCell().textContent = roundToNearestHundred(totalIncome) + " €"; 
    });

    // Display the taxable base
    const taxableBaseRow = resultsTable.insertRow();
    taxableBaseRow.insertCell().textContent = 'Taxable Base';
    selectedCountries.forEach(countryCode => {
        taxableBaseRow.insertCell().textContent = roundToNearestHundred(results[countryCode].taxableBase) + " €";
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
                cell.innerHTML += `<br>Income per part: ${roundToNearestHundred(perPart)} €`;
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
                        detailRow.insertCell().textContent = `${roundToNearestHundred(detail.taxableAmount)} € → ${roundToNearestHundred(detail.taxAmount)} €`;
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
        incomeTaxRow.insertCell().textContent = roundToNearestHundred(results[countryCode].incomeTax) + " €";
    });

    // Social security
    const socialSecurityRow = resultsTable.insertRow();
    socialSecurityRow.insertCell().textContent = 'Social Security';
    selectedCountries.forEach(countryCode => {
        socialSecurityRow.insertCell().textContent = roundToNearestHundred(results[countryCode].socialSecurity) + " €";
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
        otherTaxesRow.insertCell().textContent = roundToNearestHundred(otherTaxes) + " €";
    });

    // Total deductions
    const totalDeductionsRow = resultsTable.insertRow();
    totalDeductionsRow.insertCell().textContent = 'Total Deductions';
    totalDeductionsRow.classList.add('highlight');
    selectedCountries.forEach(countryCode => {
        totalDeductionsRow.insertCell().textContent = roundToNearestHundred(results[countryCode].totalDeductions) + " €";
    });

    // Net income
    const netIncomeRow = resultsTable.insertRow();
    netIncomeRow.insertCell().textContent = 'Net Income';
    netIncomeRow.classList.add('highlight');
    selectedCountries.forEach(countryCode => {
        netIncomeRow.insertCell().textContent = roundToNearestHundred(results[countryCode].netIncome) + " €";
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
            currencyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            config.selectedCurrency = button.value;
        });
    });
    
    // Add event listener for fill test data button
    const fillTestDataButton = document.getElementById('fill-test-data');
    if (fillTestDataButton) {
        fillTestDataButton.addEventListener('click', () => {
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
        });
    }
    
    // Add event listener for view mode toggle
    const viewModeToggle = document.getElementById('view-mode-toggle');
    const viewModeLabel = document.getElementById('view-mode-label');
    
    if (viewModeToggle && viewModeLabel) {
        viewModeToggle.addEventListener('change', function() {
            const isDetailedView = this.checked;
            viewModeLabel.textContent = isDetailedView ? 'Detailed View' : 'Simple View';
            
            const existingResults = resultsTable.querySelector('tbody');
            if (existingResults && existingResults.children.length > 0) {
                const results = calculateTaxes(selectedCountries);
                if (results) {
                    displayResults(results, selectedCountries, taxData, resultsTable, isDetailedView);
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
                    const isDetailedView = document.getElementById('view-mode-toggle').checked;
                    displayResults(results, selectedCountries, taxData, resultsTable, isDetailedView);
                    console.log('Results displayed');
                }
            }
        });
    }
}

export function parseURLParams(config) {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('fillTestData') && urlParams.get('fillTestData') === 'true') {
        console.log('Filling test data from URL parameter');
        const context = {
            selectedCountries: config.selectedCountries,
            totalIncome: config.totalIncome,
            resultsTable: config.resultsTable,
            toggleCountry,
            ...config.renderCallbacks
        };
        fillTestData(context);
    }
    
    if (urlParams.has('calculate') && urlParams.get('calculate') === 'true') {
        console.log('Calculating taxes from URL parameter');
        setTimeout(() => {
            config.calculateButton.click();
        }, 500);
    }
    
    if (urlParams.has('view')) {
        const viewMode = urlParams.get('view');
        const viewModeToggle = document.getElementById('view-mode-toggle');
        
        if (viewMode === 'detailed' && !viewModeToggle.checked) {
            viewModeToggle.checked = true;
            viewModeToggle.dispatchEvent(new Event('change'));
        } else if (viewMode === 'simple' && viewModeToggle.checked) {
            viewModeToggle.checked = false;
            viewModeToggle.dispatchEvent(new Event('change'));
        }
    }
} 