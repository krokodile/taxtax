/**
 * Utility functions for the Tax Calculator
 */

/**
 * Resets all data and UI components to their initial state
 * @param {Object} context - The global context with variables and functions
 */
export function resetData(context = window) {
    // Reset global variables
    context.selectedCountries = [];
    document.querySelectorAll('.country-selector button').forEach(button => {
        button.classList.remove('active');
    });
    context.totalIncome = 0;

    // Clear results table
    context.resultsTable.innerHTML = '';
    
    // Re-render the UI components
    context.renderIncomeTypes();
    context.renderQuestions();
    context.renderTaxBenefits();
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