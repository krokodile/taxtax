// Import country-specific calculations
import { calculateIncomeTaxCY, calculateSocialSecurityCY } from './countries/cy.js';
import { calculateIncomeTaxUK, calculateSocialSecurityUK } from './countries/uk.js';
import { calculateIncomeTaxFR, calculateSocialSecurityFR } from './countries/fr.js';
import { calculateIncomeTaxES, calculateSocialSecurityES } from './countries/es.js';
import { calculateTaxableBasePT, calculateIncomeTaxPT, calculateSocialSecurityPT } from './countries/pt.js';
import { convertCurrency, nativeCurrencies } from './utils.js';

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
    // Get common data from the form
    const commonData = collectCommonData();
    
    // Get the selected currency
    const selectedCurrency = document.querySelector('.currency-control button.active').value;
    commonData.selectedCurrency = selectedCurrency;
    
    // If no income, return null
    if (commonData.totalIncome <= 0) {
        alert('Please enter income amount');
        return null;
    }
    
    // Collect tax benefits for each country
    commonData.taxBenefits = {};
    selectedCountries.forEach(countryCode => {
        commonData.taxBenefits[countryCode] = {};
        
        // Check for country-specific tax benefits
        if (countryCode === 'pt') {
            const nhrCheckbox = document.getElementById('pt-nhrStatus');
            const ificiCheckbox = document.getElementById('pt-ifici');
            commonData.taxBenefits.pt.nhrStatus = nhrCheckbox?.checked || false;
            commonData.taxBenefits.pt.ifici = ificiCheckbox?.checked || false;
        } else if (countryCode === 'es') {
            const beckhamLawCheckbox = document.getElementById('es-beckhamLaw');
            commonData.taxBenefits.es.beckhamLaw = beckhamLawCheckbox?.checked || false;
        } else if (countryCode === 'uk') {
            const blindPersonsAllowanceCheckbox = document.getElementById('uk-blindPersonsAllowance');
            commonData.taxBenefits.uk.blindPersonsAllowance = blindPersonsAllowanceCheckbox?.checked || false;
        } else if (countryCode === 'cy') {
            const highSkilledResidentCheckbox = document.getElementById('cy-highSkilledResident');
            commonData.taxBenefits.cy.highSkilledResident = highSkilledResidentCheckbox?.checked || false;
        }
    });
    
    // Calculate country-specific data
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
    
    // Get the native currency for this country
    const nativeCurrency = nativeCurrencies[countryCode];
    
    // Store original income in selected currency for reference
    results.originalIncome = commonData.totalIncome;
    
    // Convert total income from selected currency to native currency for calculations
    const totalIncomeInNativeCurrency = convertCurrency(
        commonData.totalIncome, 
        commonData.selectedCurrency, 
        nativeCurrency
    );
    
    // Use the converted income for calculations
    const calculationIncome = totalIncomeInNativeCurrency;
    
    // Country-specific calculations
    if (countryCode === 'pt') {
        // Portugal calculations
        const nhr = commonData.taxBenefits.pt.nhrStatus;
        const ifici = commonData.taxBenefits.pt.ifici;
        
        results.taxRegimeNote = nhr ? "NHR Status (20% flat tax rate)" : 
                               ifici ? "IFICI Tax Benefit (20% flat tax rate)" : "";
        
        // Calculate Portuguese taxable base using imported function
        const { taxableBase, taxableBaseNote } = calculateTaxableBasePT(calculationIncome, commonData);
        results.taxableBase = taxableBase;
        results.taxableBaseNote = taxableBaseNote;
        
        // Calculate Portuguese income tax using imported function
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxPT(results.taxableBase, nhr, ifici);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate Portuguese social security using imported function
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityPT(calculationIncome, commonData);
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
        results.taxableBase = calculationIncome;
        results.familyQuotient = familyQuotient;
        results.taxRegimeNote = `Family Quotient: ${familyQuotient} parts`;
        
        // Store original taxable base for display
        results.originalTaxableBase = calculationIncome;
        
        // Calculate French income tax using imported function
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxFR(calculationIncome, familyQuotient);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        if (commonData.yearsInBusiness > 0) {
            results.taxRegimeNote += `, Years in Business: ${commonData.yearsInBusiness}`;
        }
        
        // Calculate French social security using imported function
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityFR(
            calculationIncome, 
            commonData.yearsInBusiness,
            commonData.hasSoleProprietorship
        );
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    } 
    else if (countryCode === 'uk') {
        // UK tax calculations
        let taxableBase = calculationIncome;
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
        
        if (calculationIncome > 100000) {
            // Reduce personal allowance by £1 for every £2 over £100,000
            const reduction = Math.min(personalAllowance, Math.floor((calculationIncome - 100000) / 2));
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
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityUK(calculationIncome);
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    } 
    else if (countryCode === 'es') {
        // Spanish calculations
        const beckhamLaw = commonData.taxBenefits.es.beckhamLaw;
        
        // Set taxable base for Spain
        results.taxableBase = calculationIncome;
        
        // Add tax regime note if Beckham Law is applied
        if (beckhamLaw) {
            results.taxRegimeNote = "Beckham's Law (24% flat tax rate up to €600,000)";
        } else {
            results.taxRegimeNote = "";
        }
        
        // Calculate Spanish income tax
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxES(calculationIncome, beckhamLaw);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate Spanish social security
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityES(calculationIncome, commonData);
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    }
    else if (countryCode === 'cy') {
        // Cyprus calculations
        const highSkilledResident = commonData.taxBenefits.cy.highSkilledResident;
        
        results.taxRegimeNote = highSkilledResident ? "High-Skilled Resident (50% tax exemption)" : "";
        
        results.taxableBase = calculationIncome;
        
        // Calculate Cyprus income tax using imported function
        const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTaxCY(calculationIncome, highSkilledResident);
        results.incomeTax = totalIncomeTax;
        results.incomeTaxDetails = incomeTaxDetails;
        
        // Calculate Cyprus social security using imported function
        const { socialSecurity, socialSecurityNote } = calculateSocialSecurityCY(calculationIncome);
        results.socialSecurity = socialSecurity;
        results.socialSecurityNote = socialSecurityNote;
    }

    // Convert results back to selected currency
    results.taxableBase = convertCurrency(parseFloat(results.taxableBase), nativeCurrency, commonData.selectedCurrency);
    results.incomeTax = convertCurrency(parseFloat(results.incomeTax), nativeCurrency, commonData.selectedCurrency);
    results.socialSecurity = convertCurrency(parseFloat(results.socialSecurity), nativeCurrency, commonData.selectedCurrency);
    
    if (results.otherTaxes) {
        results.otherTaxes = convertCurrency(parseFloat(results.otherTaxes), nativeCurrency, commonData.selectedCurrency);
    }
    
    // Convert income tax details
    if (results.incomeTaxDetails) {
        results.incomeTaxDetails = results.incomeTaxDetails.map(detail => ({
            rate: detail.rate,
            taxableAmount: convertCurrency(parseFloat(detail.taxableAmount), nativeCurrency, commonData.selectedCurrency).toFixed(2),
            taxAmount: convertCurrency(parseFloat(detail.taxAmount), nativeCurrency, commonData.selectedCurrency).toFixed(2)
        }));
    }
    
    // Final calculations in selected currency
    results.otherTaxes = results.otherTaxes || 0; // Default to 0 if not set
    results.totalDeductions = parseFloat(results.incomeTax) + parseFloat(results.socialSecurity) + parseFloat(results.otherTaxes);
    
    // Use the original income for net income calculation, not the converted one
    results.netIncome = commonData.totalIncome - results.totalDeductions;
    results.effectiveTaxRate = ((results.totalDeductions / commonData.totalIncome) * 100).toFixed(2);

    return results;
} 