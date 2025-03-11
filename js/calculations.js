// Import country-specific calculations
import { calculateIncomeTaxCY, calculateSocialSecurityCY } from './countries/cy.js';
import { calculateIncomeTaxUK, calculateSocialSecurityUK } from './countries/uk.js';
import { calculateIncomeTaxFR, calculateSocialSecurityFR } from './countries/fr.js';
import { calculateIncomeTaxES, calculateSocialSecurityES } from './countries/es.js';
import { calculateTaxableBasePT, calculateIncomeTaxPT, calculateSocialSecurityPT } from './countries/pt.js';

export function collectCommonData() {
    const commonData = {};
    
    // Get total income
    commonData.totalIncome = calculateTotalIncome();
    
    // Get common question values from shared fields
    const maritalStatusControl = document.getElementById('maritalStatus');
    commonData.maritalStatus = maritalStatusControl ? 
        maritalStatusControl.querySelector('button.active')?.value : 'Single';
    
    const childrenInput = document.getElementById('children');
    commonData.numChildren = childrenInput ? parseInt(childrenInput.value) || 0 : 0;

    // Access income for sole proprietorship using a consistent ID format
    const checkbox = document.getElementById('income-soleProprietorship');
    commonData.hasSoleProprietorship = checkbox?.checked || false;
    commonData.soleProprietorshipIncome = 0;
    if (commonData.hasSoleProprietorship) {
        const amountInput = document.getElementById('amount-soleProprietorship');
        commonData.soleProprietorshipIncome = parseFloat(amountInput.value) || 0;
    }
    
    // Get years in business if applicable
    commonData.yearsInBusiness = parseInt(document.getElementById('yearsInBusiness')?.value || 0);
    
    // Initialize questions object for each country
    commonData.questions = {
        es: {},
        pt: {},
        fr: {},
        uk: {},
        cy: {}
    };
    
    // Get tax benefits for each country
    commonData.taxBenefits = {
        pt: {
            nhr: document.getElementById('pt-nhrStatus')?.checked || false,
            ifici: document.getElementById('pt-ifici')?.checked || false
        },
        es: {
            beckhamLaw: document.getElementById('es-beckhamLaw')?.checked || false
        },
        uk: {
            blindPersonsAllowance: document.getElementById('uk-blindPersonsAllowance')?.checked || false
        },
        cy: {
            highSkilledResident: document.getElementById('cy-highSkilledResident')?.checked || false
        }
    };
    
    // Get regime for Portugal
    const ptRegimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
    commonData.ptRegime = 'Simplified Regime'; // Default
    if (ptRegimeControl) {
        const activeButton = ptRegimeControl.querySelector('button.active');
        if (activeButton) {
            commonData.ptRegime = activeButton.value;
        }
    }
    
    return commonData;
}

export function calculateTotalIncome() {
    let total = 0;
    console.log('Calculating total income...');
    // Get all income type checkboxes
    const incomeCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="income-"]');
    console.log('Found checkboxes:', incomeCheckboxes.length);
    
    incomeCheckboxes.forEach(checkbox => {
        console.log('Checking checkbox:', checkbox.id, 'checked:', checkbox.checked);
        if (checkbox.checked) {
            const incomeType = checkbox.dataset.incomeType;
            const amountInput = document.getElementById(`amount-${incomeType}`);
            console.log('Amount input:', amountInput?.value);
            if (amountInput) {
                const amount = parseFloat(amountInput.value) || 0;
                total += amount;
                console.log('Added amount:', amount, 'Total:', total);
            }
        }
    });
    
    console.log('Final total:', total);
    return total;
}

export function calculateTaxes(selectedCountries) {
    // Collect all data from the DOM in one place
    const commonData = collectCommonData();
    const totalIncome = commonData.totalIncome;

    if (totalIncome <= 0) {
        alert("Error: Please specify at least one income type and enter an amount.");
        return null;
    }

    // Validate years in business
    if (!validateYearsInBusiness(commonData.hasSoleProprietorship, selectedCountries, commonData.yearsInBusiness)) {
        return null;
    }

    const results = {};
    selectedCountries.forEach(countryCode => {
        results[countryCode] = calculateCountrySpecificData(countryCode, commonData);
    });

    return results;
}

export function validateYearsInBusiness(hasSoleProprietorship, selectedCountries, yearsInBusiness) {
    // First check if sole proprietorship income is selected
    if (!hasSoleProprietorship) {
        return true;
    }
    
    // Check if France or Portugal are selected (countries where years in business matter)
    const relevantCountrySelected = selectedCountries.includes('fr') || selectedCountries.includes('pt');
    
    // If no relevant country selected, no validation needed
    if (!relevantCountrySelected) {
        return true;
    }
    
    // Now we know we need to validate the years
    const errorDiv = document.getElementById('yearsInBusiness-error');
    
    if (yearsInBusiness === undefined || yearsInBusiness === null || yearsInBusiness < 0) {
        if (errorDiv) {
            errorDiv.textContent = 'Please enter a valid number of years in business.';
            errorDiv.style.display = 'block';
        }
        return false;
    }
    
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    return true;
}

// Helper function for income tax calculation
function calculateIncomeTax(taxableBase, brackets) {
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

function calculateOtherSocialSecurity(totalIncome) {
    const IAS = 509.26; // 2024 IAS value
    const monthlyCeiling = 12 * IAS;
    const monthlyFloor = IAS;
    let monthlyTaxableBase = totalIncome / 12;
    let socialSecurityNote = "";
    if(monthlyTaxableBase > monthlyCeiling){
        monthlyTaxableBase = monthlyCeiling;
        socialSecurityNote = "Ceiling Reached";
    } else if (monthlyTaxableBase < monthlyFloor){
        monthlyTaxableBase = monthlyFloor;
        socialSecurityNote = "Floor applied";
    }
    let socialSecurity = monthlyTaxableBase * 0.214 * 12; //always use 0.214 - other countries are treated as independent workers
    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
}

export function calculateCountrySpecificData(countryCode, commonData) {
    const results = {};
    
    // Set default values
    results.taxableBase = commonData.totalIncome;
    results.taxRegimeNote = "";
    
    // Country-specific calculations for taxable base and tax regime
    if (countryCode === 'pt') {
        // Portuguese calculations
        const regime = commonData.ptRegime;
        
        results.taxableBase = calculateTaxableBasePT(
            commonData.soleProprietorshipIncome, 
            commonData.totalIncome, 
            regime, 
            commonData.yearsInBusiness
        );
        
        results.taxRegimeNote = regime === 'Simplified Regime'
            ? "Simplified Regime (75% Income Tax, 70% Social Security)"
            : "Organized Accounting";
            
        // Calculate Portuguese income tax
        const nhr = commonData.taxBenefits.pt.nhr;
        const ifici = commonData.taxBenefits.pt.ifici;
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxPT(results.taxableBase, nhr, ifici);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate Portuguese social security
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityPT(
            commonData.soleProprietorshipIncome, 
            commonData.totalIncome, 
            regime, 
            commonData.yearsInBusiness,
            commonData.hasSoleProprietorship
        );
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    } 
    else if (countryCode === 'fr') {
        // Calculate French family quotient
        let familyQuotient = commonData.maritalStatus === 'Married' ? 2 : 1; // Base quotient
        
        // Add quotient for children
        if (commonData.numChildren >= 1) familyQuotient += 0.5; // First child
        if (commonData.numChildren >= 2) familyQuotient += 0.5; // Second child
        if (commonData.numChildren > 2) familyQuotient += (commonData.numChildren - 2); // Third and subsequent children get 1 part each
        
        // Calculate taxable base with family quotient
        results.taxableBase = commonData.totalIncome;
        results.familyQuotient = familyQuotient;
        results.taxRegimeNote = `Family Quotient: ${familyQuotient} parts`;
        
        // Store original taxable base for display
        results.originalTaxableBase = commonData.totalIncome;
        
        // Calculate French income tax using imported function
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxFR(commonData.totalIncome, familyQuotient);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        if (commonData.yearsInBusiness > 0) {
            results.taxRegimeNote += `, Years in Business: ${commonData.yearsInBusiness}`;
        }
        
        // Calculate French social security using imported function
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityFR(
            commonData.totalIncome, 
            commonData.yearsInBusiness,
            commonData.hasSoleProprietorship
        );
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    } 
    else if (countryCode === 'uk') {
        // UK tax calculations
        let taxableBase = commonData.totalIncome;
        let taxRegimeNote = "";
        
        // Apply Blind Person's Allowance if selected
        const blindPersonsAllowance = commonData.taxBenefits.uk.blindPersonsAllowance;
        if (blindPersonsAllowance) {
            taxableBase -= 3070; // 2024 Blind Person's Allowance
            taxRegimeNote = "Blind Person's Allowance: £3,070";
        }
        
        // Personal Allowance reduction for high earners
        const personalAllowance = 12570; // 2024 Personal Allowance
        let adjustedPersonalAllowance = personalAllowance;
        
        if (commonData.totalIncome > 100000) {
            // Reduce personal allowance by £1 for every £2 over £100,000
            const reduction = Math.min(personalAllowance, Math.floor((commonData.totalIncome - 100000) / 2));
            adjustedPersonalAllowance -= reduction;
            
            if (taxRegimeNote) {
                taxRegimeNote += ", ";
            }
            taxRegimeNote += `Reduced Personal Allowance: £${adjustedPersonalAllowance.toLocaleString()}`;
        }
        
        results.taxableBase = taxableBase;
        results.taxRegimeNote = taxRegimeNote;
        
        // Calculate income tax using the imported function
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxUK(taxableBase, adjustedPersonalAllowance);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate UK National Insurance using imported function
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityUK(commonData.totalIncome);
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    } 
    else if (countryCode === 'es') {
        // Spanish calculations
        const beckhamLaw = commonData.taxBenefits.es.beckhamLaw;
        
        // Calculate Spanish income tax
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxES(results.taxableBase, beckhamLaw);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate Spanish social security
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityES(commonData.totalIncome, commonData);
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    }
    else if (countryCode === 'cy') {
        // Cyprus calculations
        const highSkilledResident = commonData.taxBenefits.cy.highSkilledResident;
        
        results.taxRegimeNote = highSkilledResident ? "High-Skilled Resident (50% tax exemption)" : "";
        
        results.taxableBase = commonData.totalIncome;
        
        // Calculate Cyprus income tax using imported function
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxCY(results.taxableBase, highSkilledResident);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate Cyprus social security using imported function
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityCY(commonData.totalIncome);
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    }

    // Final calculations
    results.otherTaxes = results.otherTaxes || 0; // Default to 0 if not set
    results.totalDeductions = parseFloat(results.incomeTax) + parseFloat(results.socialSecurity) + parseFloat(results.otherTaxes);
    results.netIncome = commonData.totalIncome - results.totalDeductions;
    results.effectiveTaxRate = ((results.totalDeductions / commonData.totalIncome) * 100).toFixed(2);

    return results;
} 