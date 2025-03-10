// Portugal tax settings
export const taxData = {
    name: 'Portugal',
    flag: '🇵🇹',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0.145 },
        { threshold: 7479, rate: 0.21 },
        { threshold: 11284, rate: 0.265 },
        { threshold: 15992, rate: 0.285 },
        { threshold: 20700, rate: 0.35 },
        { threshold: 25246, rate: 0.37 },
        { threshold: 36967, rate: 0.435 },
        { threshold: 48033, rate: 0.45 },
        { threshold: 75009, rate: 0.48 }
    ],
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'nhrStatus', label: 'NHR Status', type: 'checkbox' },
        { id: 'ifici', label: 'IFICI', type: 'checkbox' }
    ]
};

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

export function calculateTaxableBasePT(ptSoleProprietorshipIncome, totalIncome, regime, yearsInBusiness) {
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

export function calculateIncomeTaxPT(taxableBase, nhr, ifici) {
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
        return calculateIncomeTax(taxableBase, taxData.incomeTaxBrackets);
    }
}

export function calculateSocialSecurityPT(ptSoleProprietorshipIncome, totalIncome, regime, yearsInBusiness, hasSoleProprietorship) {
    const IAS = 509.26; // 2024 IAS value
    const monthlyCeiling = 12 * IAS;
    const monthlyFloor = IAS;
    let taxableBaseForSS = 0;
    let socialSecurityNote = "";
    let rate = 0.11; // Default rate for employment income (11% for employee part only)

    // Apply discount for the first three years for sole proprietorship
    let discountFactor = 1;
    if (yearsInBusiness === 1) {
        discountFactor = 0; // 50% reduction in the first year
    } 

    // Check if this is sole proprietorship income
    if (hasSoleProprietorship) {
        rate = 0.214; // Use 21.4% for sole proprietorship as they pay both parts
        if (regime === 'Simplified Regime') {
            taxableBaseForSS = (ptSoleProprietorshipIncome * 0.70 * discountFactor) / 12;
        } else {
            taxableBaseForSS = (ptSoleProprietorshipIncome * discountFactor) / 12;
        }
    } else {
        // For employment income, use the regular base
        taxableBaseForSS = totalIncome / 12;
    }

    // Apply ceiling/floor *monthly*
    if (taxableBaseForSS > monthlyCeiling) {
        taxableBaseForSS = monthlyCeiling;
        socialSecurityNote = "Ceiling Reached";
    } else if (taxableBaseForSS < monthlyFloor) {
        taxableBaseForSS = monthlyFloor * discountFactor;
        socialSecurityNote = "Floor Applied";
    }

    const socialSecurity = taxableBaseForSS * rate * 12;
    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
} 