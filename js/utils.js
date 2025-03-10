/**
 * Utility functions for the Tax Calculator
 */

/**
 * Resets all data and UI components to their initial state
 * @param {Object} context - The global context with variables and functions
 */
export function resetData(context = window) {
    // Store current selected countries to properly deselect them
    const currentSelectedCountries = [...context.selectedCountries];
    
    // Reset global variables
    context.selectedCountries = [];
    
    // Properly deselect each country by calling toggleCountry for each currently selected country
    currentSelectedCountries.forEach(countryCode => {
        // We need to add them back temporarily for toggleCountry to work correctly
        context.selectedCountries.push(countryCode);
        context.toggleCountry(countryCode);
    });
    
    // Ensure the array is empty (in case toggleCountry didn't work as expected)
    context.selectedCountries = [];
    
    // Also manually remove active class from all country buttons
    document.querySelectorAll('.country-selector button').forEach(button => {
        button.classList.remove('active');
    });
    
    context.totalIncome = 0;

    // Clear results table
    context.resultsTable.innerHTML = '';
    
    // Reset all income type checkboxes and amounts
    document.querySelectorAll('input[type="checkbox"][id^="income-"]').forEach(checkbox => {
        checkbox.checked = false;
        
        // Get the corresponding amount input and reset it
        const incomeType = checkbox.dataset.incomeType;
        const amountInput = document.getElementById(`amount-${incomeType}`);
        if (amountInput) {
            amountInput.value = '0';
            amountInput.disabled = true;
            
            // Hide the amount input container
            const amountContainer = amountInput.closest('div');
            if (amountContainer) {
                amountContainer.style.visibility = 'hidden';
            }
        }
    });
    
    // Reset all tax benefit checkboxes
    document.querySelectorAll('#tax-benefits-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset all number inputs in the questions container
    document.querySelectorAll('#questions-container input[type="number"]').forEach(input => {
        input.value = '0';
    });
    
    // Reset all text inputs in the questions container
    document.querySelectorAll('#questions-container input[type="text"]').forEach(input => {
        input.value = '';
    });
    
    // Reset all checkboxes in the questions container
    document.querySelectorAll('#questions-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset all select elements in the questions container
    document.querySelectorAll('#questions-container select').forEach(select => {
        if (select.options.length > 0) {
            select.selectedIndex = 0;
        }
    });
    
    // Reset all segmented controls to first option
    document.querySelectorAll('.segmented-control').forEach(control => {
        const buttons = control.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (buttons.length > 0) {
            buttons[0].classList.add('active');
        }
    });
    
    // Reset years in business field
    const yearsInBusinessInput = document.getElementById('yearsInBusiness');
    if (yearsInBusinessInput) {
        yearsInBusinessInput.value = '';
    }
    
    // Reset additional info containers visibility
    document.querySelectorAll('td div[style*="visibility"]').forEach(div => {
        div.style.visibility = 'hidden';
    });
    
    // Re-render the UI components
    context.renderIncomeTypes();
    context.renderQuestions();
    context.renderTaxBenefits();
    
    // Disable calculate button since no countries are selected
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        calculateButton.disabled = true;
        calculateButton.style.opacity = '0.5';
    }
}

/**
 * Fills the form with test data for quick testing
 * @param {Object} context - The global context with variables and functions
 */
export function fillTestData(context = window) {
    // Start with a clean slate
    context.selectedCountries = [];
    document.querySelectorAll('.country-selector button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Select all countries
    context.toggleCountry('fr');
    context.toggleCountry('es');
    context.toggleCountry('pt');
    context.toggleCountry('uk');
    context.toggleCountry('cy');

    // Set Sole Proprietorship income
    const soleProprietorshipCheckbox = document.getElementById('income-soleProprietorship');
    if (soleProprietorshipCheckbox) {
        soleProprietorshipCheckbox.checked = true;
        
        // Trigger the change event to show fields
        const changeEvent = new Event('change');
        soleProprietorshipCheckbox.dispatchEvent(changeEvent);
        
        // Set amount
        const soleProprietorshipAmount = document.getElementById('amount-soleProprietorship');
        if (soleProprietorshipAmount) {
            soleProprietorshipAmount.value = 80000;
            soleProprietorshipAmount.disabled = false;
        }
        
        // Set regime to Simplified Regime
        const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
        if (regimeControl) {
            const simplifiedButton = regimeControl.querySelector('button[value="Simplified Regime"]');
            if (simplifiedButton) {
                // Remove active class from all buttons
                regimeControl.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to the Simplified Regime button
                simplifiedButton.classList.add('active');
            }
        }
        
        // Set years in business to 1
        const yearsInBusinessInput = document.getElementById('yearsInBusiness');
        if (yearsInBusinessInput) {
            yearsInBusinessInput.value = 1;
        }
    }

    // Set marital status to Married (common question)
    const maritalStatus = document.getElementById('maritalStatus');
    if (maritalStatus) {
        // For segmented controls, find the "Married" button and click it
        const marriedButton = maritalStatus.querySelector('button[value="Married"]');
        if (marriedButton) {
            marriedButton.click();
        }
    }

    // Set number of children to 2 (common question)
    const children = document.getElementById('children');
    if (children) {
        children.value = 2;
    }

    // Scroll to calculate button
    const calculateButton = document.getElementById('calculate-button');
    calculateButton.scrollIntoView({ behavior: 'smooth' });
} 