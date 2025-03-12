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

/**
 * Calculate the taxable base for Portugal
 * @param {number} totalIncome - The total income in EUR
 * @param {Object} commonData - Common data object with additional information
 * @returns {Object} - Object with taxableBase and taxableBaseNote
 */
export function calculateTaxableBasePT(totalIncome, commonData) {
    let taxableBase = totalIncome;
    let taxableBaseNote = "";
    
    // Check if there's sole proprietorship income
    if (commonData.hasSoleProprietorship) {
        const soleProprietorshipIncome = commonData.soleProprietorshipIncome;
        const yearsInBusiness = commonData.yearsInBusiness || 0;
        
        // Get the regime from the UI
        const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
        const regime = regimeControl ? 
            regimeControl.querySelector('button.active')?.value || 'Simplified Regime' : 
            'Simplified Regime';
        
        if (regime === 'Simplified Regime') {
            // In Simplified Regime, only 75% of income is taxable
            const taxablePercentage = 0.75;
            taxableBase = soleProprietorshipIncome * taxablePercentage;
            taxableBaseNote = `Simplified Regime: ${(taxablePercentage * 100)}% of income is taxable`;
        } else {
            // In Organized Accounting, all income is taxable
            taxableBase = soleProprietorshipIncome;
            taxableBaseNote = "Organized Accounting: 100% of income is taxable";
        }
    }
    
    return { taxableBase, taxableBaseNote };
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

/**
 * Calculate social security contributions for Portugal
 * @param {number} totalIncome - The total income in EUR
 * @param {Object} commonData - Common data object with additional information
 * @returns {Object} - Object with socialSecurity and socialSecurityNote
 */
export function calculateSocialSecurityPT(totalIncome, commonData) {
    let socialSecurity = 0;
    let socialSecurityNote = "";
    
    // Check if there's sole proprietorship income
    if (commonData.hasSoleProprietorship) {
        const soleProprietorshipIncome = commonData.soleProprietorshipIncome;
        const yearsInBusiness = commonData.yearsInBusiness || 0;
        
        // Get the regime from the UI
        const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
        const regime = regimeControl ? 
            regimeControl.querySelector('button.active')?.value || 'Simplified Regime' : 
            'Simplified Regime';
        
        if (regime === 'Simplified Regime') {
            // In Simplified Regime, social security is calculated on 70% of income
            const taxablePercentage = 0.70;
            const rate = 0.214; // 21.4% for self-employed
            
            // First year: exempt, second year: 25%, third year: 50%, fourth year and beyond: 100%
            let reductionFactor = 1.0;
            if (yearsInBusiness === 0) {
                reductionFactor = 0.0;
                socialSecurityNote = "First year: Exempt from Social Security";
            } else if (yearsInBusiness === 1) {
                reductionFactor = 0.25;
                socialSecurityNote = "Second year: 25% of normal Social Security";
            } else if (yearsInBusiness === 2) {
                reductionFactor = 0.5;
                socialSecurityNote = "Third year: 50% of normal Social Security";
            } else {
                socialSecurityNote = `${(rate * 100).toFixed(1)}% on ${(taxablePercentage * 100)}% of income`;
            }
            
            socialSecurity = soleProprietorshipIncome * taxablePercentage * rate * reductionFactor;
        } else {
            // In Organized Accounting, social security is calculated on 100% of income
            const rate = 0.214; // 21.4% for self-employed
            socialSecurity = soleProprietorshipIncome * rate;
            socialSecurityNote = `${(rate * 100).toFixed(1)}% of income`;
        }
    } else {
        // For employment income, use the standard rate
        const rate = 0.11; // 11% for employees
        socialSecurity = totalIncome * rate;
        socialSecurityNote = `${(rate * 100).toFixed(1)}% of income`;
    }
    
    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
} 