// taxUtils.js - Common utility functions for tax calculations

// Calculate total income from all income types
function calculateTotalIncome() {
    let total = 0;
    document.querySelectorAll('input[type="checkbox"][id^="income-"]').forEach(checkbox => {
        if (checkbox.checked) {
            const incomeType = checkbox.dataset.incomeType;
            const amountInput = document.getElementById(`amount-${incomeType}`);
            if (amountInput) {
                const amount = parseFloat(amountInput.value) || 0;
                total += amount;
            }
        }
    });
    return total;
}

// Generic progressive tax calculation function
function calculateProgressiveTax(taxableBase, brackets) {
    const incomeTaxDetails = [];
    let totalIncomeTax = 0;
    let remainingIncome = taxableBase;

    brackets.forEach((bracket, index) => {
        const nextThreshold = index < brackets.length - 1 ? brackets[index + 1].threshold : Infinity;
        const taxableAtThisRate = Math.min(remainingIncome, nextThreshold - bracket.threshold);
        const taxAtThisRate = taxableAtThisRate * bracket.rate;
        totalIncomeTax += taxAtThisRate;

        if (taxableAtThisRate > 0) {
            incomeTaxDetails.push({
                rate: bracket.rate,
                taxableAmount: taxableAtThisRate.toFixed(2),
                taxAmount: taxAtThisRate.toFixed(2)
            });
        }
        remainingIncome -= taxableAtThisRate;
    });

    return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
}

// Validate years in business input
function validateYearsInBusiness() {
    // Check for both Portugal and France
    const ptYearsInBusinessInput = document.getElementById('pt-yearsInBusiness');
    const frYearsInBusinessInput = document.getElementById('fr-yearsInBusiness');
    const errorDiv = document.getElementById('yearsInBusiness-error');
    
    // Check Portugal's field if it exists and is visible
    if (ptYearsInBusinessInput && ptYearsInBusinessInput.style.display !== 'none') {
        if (ptYearsInBusinessInput.value === '' || parseInt(ptYearsInBusinessInput.value) < 0) {
            errorDiv.textContent = 'Please enter a valid number of years in business.';
            errorDiv.style.display = 'block';
            return false;
        } else {
            errorDiv.style.display = 'none';
        }
    }
    
    // Check France's field if it exists and is visible
    if (frYearsInBusinessInput && frYearsInBusinessInput.style.display !== 'none') {
        if (frYearsInBusinessInput.value === '' || parseInt(frYearsInBusinessInput.value) < 0) {
            errorDiv.textContent = 'Please enter a valid number of years in business.';
            errorDiv.style.display = 'block';
            return false;
        } else {
            errorDiv.style.display = 'none';
        }
    }
    
    return true;
}

// Helper function to round to nearest 100
function roundToNearestHundred(value) {
    return Math.round(value / 100) * 100;
}

// Update sole proprietorship fields visibility based on income type selection
function updateSoleProprietorshipFields(incomeType, countryPrefix) {
    const regimeControl = document.getElementById(`${countryPrefix}-ptSoleProprietorshipRegime`);
    const amountInput = document.getElementById(`${countryPrefix}-amount-soleProprietorship`);
    const yearsInBusinessInput = document.getElementById(`${countryPrefix}-yearsInBusiness`);

    if (regimeControl) {
        regimeControl.style.display = incomeType === 'soleProprietorship' ? 'flex' : 'none';
    }
    if (amountInput) {
        amountInput.style.display = incomeType === 'soleProprietorship' ? 'block' : 'none';
    }
    if (yearsInBusinessInput) {
        yearsInBusinessInput.style.display = incomeType === 'soleProprietorship' ? 'block' : 'none';
    }

    // Hide, if exists
    const labelRegime = document.querySelector(`label[for="${countryPrefix}-ptSoleProprietorshipRegime"]`);
    if(labelRegime){
        labelRegime.style.display = incomeType === 'soleProprietorship' ? 'block' : 'none';
    }

    const labelAmount = document.querySelector(`label[for="${countryPrefix}-amount-soleProprietorship"]`);
    if(labelAmount){
        labelAmount.style.display = incomeType === 'soleProprietorship' ? 'block' : 'none';
    }

    const labelYearsInBusiness = document.querySelector(`label[for="${countryPrefix}-yearsInBusiness"]`);
    if(labelYearsInBusiness){
        labelYearsInBusiness.style.display = incomeType === 'soleProprietorship' ? 'block' : 'none';
    }
}

export { 
    calculateTotalIncome, 
    calculateProgressiveTax, 
    validateYearsInBusiness, 
    roundToNearestHundred,
    updateSoleProprietorshipFields
}; 