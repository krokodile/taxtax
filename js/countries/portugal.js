// portugal.js - Contains tax data and calculation functions for Portugal

const portugalData = {
    name: "Portugal",
    incomeTaxBrackets: [
        { threshold: 0, rate: 0.1325 },
        { threshold: 7703, rate: 0.21 },
        { threshold: 11623, rate: 0.23 },
        { threshold: 16472, rate: 0.26 },
        { threshold: 21321, rate: 0.3275 },
        { threshold: 27146, rate: 0.37 },
        { threshold: 39791, rate: 0.435 },
        { threshold: 51997, rate: 0.45 },
        { threshold: 81199, rate: 0.48 }
    ],
    socialSecurity: {
        generalRate: 0.11,  // Employee
        ceiling: 480.43 * 12 * 1.4,
    },
    questions: [
        { id: "maritalStatus", label: "Marital Status", type: "segmented", options: [
            { value: "Single", text: "Single" },
            { value: "Married", text: "Married" },
            { value: "Civil Union", text: "Civil Union" },
            { value: "Separated", text: "Separated" },
            { value: "Divorced", text: "Divorced" },
            { value: "Widowed", text: "Widowed" }
        ], common: true },
        { id: "children", label: "Number of Children", type: "number", common: true },
        { id: "childcareExpenses", label: "Childcare Expenses", type: "number", common: false },
        { id: "nhrStatus", label: "NHR Status?", type: "checkbox", common: false },
        { id: "ifici", label: "Using IFICI tax benefit?", type: "checkbox", common: false }
    ],
    incomeTypes: [
        { id: "employment", label: "Employment" },
        { id: "soleProprietorship", label: "Sole Proprietorship" },
        { id: "dividends", label: "Dividends" },
        { id: "rental", label: "Rental Income" },
        { id: "capitalGains", label: "Capital Gains" }
    ]
};

// Calculate taxable base for Portugal
function calculateTaxableBase(ptSoleProprietorshipIncome, totalIncome, regime, yearsInBusiness) {
    let taxableBase = 0;
    let discountFactor = 1;

    // Apply discount for the first three years
    if (yearsInBusiness === 1) {
        discountFactor = 0.5; // 50% reduction in the first year
    } else if (yearsInBusiness === 2) {
        discountFactor = 0.75; // 25% reduction in the second year
    }

    if (regime === 'Simplified Regime') {
        // Simplified Regime: Different percentages for income tax and social security
        taxableBase = ptSoleProprietorshipIncome * 0.75 * discountFactor; // Apply discount
    } else if (regime === 'Organized Accounting') {
        // Organized Accounting: Taxable base is based on accounting (income - expenses).
        taxableBase = ptSoleProprietorshipIncome * discountFactor; // Apply discount
    }
    // Add other income sources *to the INCOME TAX taxable base*
    taxableBase += (totalIncome - ptSoleProprietorshipIncome);
    
    return taxableBase;
}

// Calculate Portuguese income tax
function calculateIncomeTax(taxableBase, nhr, ifici) {
    if (nhr) {
        // NHR: Flat rate of 20% on Portuguese-sourced income
        const totalIncomeTax = taxableBase * 0.20;
        const incomeTaxDetails = [{
            rate: 0.20,
            taxableAmount: taxableBase.toFixed(2),
            taxAmount: totalIncomeTax.toFixed(2)
        }];
        return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
    }
    else if (ifici) {
        // IFICI: Flat rate of 20% on Portuguese-sourced income
        const totalIncomeTax = taxableBase * 0.20;
        const incomeTaxDetails = [{
            rate: 0.20,
            taxableAmount: taxableBase.toFixed(2),
            taxAmount: totalIncomeTax.toFixed(2)
        }];
        return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
    }
    else {
        // Standard Progressive Tax Calculation for Portugal
        const incomeTaxDetails = [];
        let totalIncomeTax = 0;
        let remainingIncome = taxableBase;

        portugalData.incomeTaxBrackets.forEach((bracket, index) => {
            const nextThreshold = index < portugalData.incomeTaxBrackets.length - 1 ? portugalData.incomeTaxBrackets[index + 1].threshold : Infinity;
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
}

// Calculate Portuguese social security
function calculateSocialSecurity(totalIncome) {
    const IAS = 509.26; // 2024 IAS value
    const monthlyCeiling = 12 * IAS;
    const monthlyFloor = IAS;
    let monthlyTaxableBase = totalIncome / 12;
    let socialSecurityNote = "";

    // Apply ceiling/floor *monthly*
    if (monthlyTaxableBase > monthlyCeiling) {
        monthlyTaxableBase = monthlyCeiling;
        socialSecurityNote = "Ceiling Reached";
    } else if (monthlyTaxableBase < monthlyFloor) {
        monthlyTaxableBase = monthlyFloor;
        socialSecurityNote = "Floor Applied";
    }

    // Use only employee rate of 11% instead of combined 21.4%
    const socialSecurity = monthlyTaxableBase * 0.11 * 12;
    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
}

// Main calculation function for Portugal
function calculateTaxes(totalIncome) {
    const results = {};
    let ptSoleProprietorshipIncome = 0;

    // Access income for sole proprietorship
    const checkbox = document.getElementById('income-soleProprietorship');
    if (checkbox?.checked) {
        const amountInput = document.getElementById('amount-soleProprietorship');
        ptSoleProprietorshipIncome = parseFloat(amountInput.value) || 0;
    }

    // Get regime from segmented control in income types section
    const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
    let regime = 'Simplified Regime'; // Default to Simplified Regime
    
    if (regimeControl) {
        const activeButton = regimeControl.querySelector('button.active');
        if (activeButton) {
            regime = activeButton.value;
        }
    }
    
    const yearsInBusiness = parseInt(document.getElementById('pt-yearsInBusiness')?.value || 0);
    
    // Calculate taxable base
    results.taxableBase = calculateTaxableBase(ptSoleProprietorshipIncome, totalIncome, regime, yearsInBusiness);
    results.taxRegimeNote = regime === 'Simplified Regime'
        ? "Simplified Regime (75% Income Tax, 70% Social Security)"
        : "Organized Accounting";

    // Get NHR and IFICI status
    const nhr = document.getElementById('pt-nhrStatus')?.checked || false;
    const ifici = document.getElementById('pt-ifici')?.checked || false;
    
    // Calculate income tax
    const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTax(results.taxableBase, nhr, ifici);
    results.incomeTax = totalIncomeTax;
    results.incomeTaxDetails = incomeTaxDetails;

    // Calculate social security
    const { socialSecurity, socialSecurityNote } = calculateSocialSecurity(totalIncome);
    results.socialSecurity = socialSecurity;
    results.socialSecurityNote = socialSecurityNote;

    // Final calculations
    results.totalDeductions = parseFloat(results.incomeTax) + parseFloat(results.socialSecurity);
    results.netIncome = totalIncome - results.totalDeductions;
    results.effectiveTaxRate = ((results.totalDeductions / totalIncome) * 100).toFixed(2);

    return results;
}

export { portugalData, calculateTaxes }; 