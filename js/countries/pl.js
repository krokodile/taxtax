// Polish tax settings for 2024
export const taxData = {
    name: 'Poland',
    flag: '🇵🇱',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },         // 0% up to 30,000 PLN (tax-free amount)
        { threshold: 30000, rate: 0.12 },  // 12% from 30,000 PLN to 120,000 PLN
        { threshold: 120000, rate: 0.32 }  // 32% over 120,000 PLN
    ],
    socialSecurity: {
        // Standard social security rates
        pension: 0.1952,      // 19.52% for pension insurance
        disability: 0.08,     // 8.00% for disability insurance
        sickness: 0.0245,     // 2.45% for sickness insurance
        accident: 0.0167,     // 1.67% for accident insurance (for companies with up to 9 employees)
        laborFund: 0.0245,    // 2.45% for Labor Fund and Solidarity Fund
        
        // Health insurance rates
        healthGeneral: 0.09,  // 9% for general tax scale and flat tax
        healthFlat: 0.049,    // 4.9% for flat tax (19%)
        
        // Minimum contribution base (60% of average salary for 2024)
        minContributionBase: 4694.40,
        
        // Annual limit for pension and disability contributions (2024)
        annualLimit: 234720   // 30 x average salary
    },
    flatTaxRate: 0.19,        // 19% flat tax option
    lumpSumRates: {
        software: 0.12,       // 12% for software development and related services
        standard: 0.085       // 8.5% standard rate for most services
    },
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'taxForm', label: 'Tax Form', type: 'segmented', options: [
            { value: 'General', text: 'General (12%/32%)' },
            { value: 'Flat', text: 'Flat (19%)' },
            { value: 'LumpSum', text: 'Lump Sum' }
        ]}
    ],
    taxBenefits: [
        { id: 'ulgaNaStart', label: 'Ulga na Start (first 6 months)', description: 'Exemption from social security contributions (except health insurance) for the first 6 months of business' },
        { id: 'malyZUSPlus', label: 'Mały ZUS Plus', description: 'Reduced social security contributions for small businesses with revenue below 120,000 PLN' },
        { id: 'preferencyjneZUS', label: 'Preferencyjne ZUS (first 24 months)', description: 'Reduced social security contributions for the first 24 months of business' }
    ]
};

export function calculateIncomeTaxPL(totalIncome, taxForm, lumpSumRate) {
    const incomeTaxDetails = [];
    let totalIncomeTax = 0;
    
    // For lump sum taxation, tax is calculated on revenue, not income
    if (taxForm === 'LumpSum') {
        const taxRate = lumpSumRate || taxData.lumpSumRates.standard;
        totalIncomeTax = totalIncome * taxRate;
        
        incomeTaxDetails.push({
            rate: taxRate,
            taxableAmount: totalIncome.toFixed(2),
            taxAmount: totalIncomeTax.toFixed(2)
        });
        
        return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
    }
    
    // For flat tax (19%)
    if (taxForm === 'Flat') {
        totalIncomeTax = totalIncome * taxData.flatTaxRate;
        
        incomeTaxDetails.push({
            rate: taxData.flatTaxRate,
            taxableAmount: totalIncome.toFixed(2),
            taxAmount: totalIncomeTax.toFixed(2)
        });
        
        return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
    }
    
    // For general tax scale (progressive)
    let remainingIncome = totalIncome;
    const brackets = taxData.incomeTaxBrackets;
    
    brackets.forEach((bracket, index) => {
        const nextThreshold = index < brackets.length - 1 ? brackets[index + 1].threshold : Infinity;
        const taxableAtThisRate = Math.max(0, Math.min(remainingIncome, nextThreshold - bracket.threshold));
        
        if (taxableAtThisRate > 0) {
            const taxAtThisRate = taxableAtThisRate * bracket.rate;
            totalIncomeTax += taxAtThisRate;
            
            incomeTaxDetails.push({
                rate: bracket.rate,
                taxableAmount: taxableAtThisRate.toFixed(2),
                taxAmount: taxAtThisRate.toFixed(2)
            });
            
            remainingIncome -= taxableAtThisRate;
        }
    });
    
    // Apply tax-reducing amount (3,600 PLN) for the general tax scale
    if (taxForm === 'General' && totalIncome > 30000) {
        const taxReduction = 3600;
        totalIncomeTax = Math.max(0, totalIncomeTax - taxReduction);
        
        // Add note about tax reduction
        incomeTaxDetails.push({
            rate: 'Reduction',
            taxableAmount: '30000.00',
            taxAmount: (-taxReduction).toFixed(2)
        });
    }
    
    return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
}

export function calculateSocialSecurityPL(totalIncome, commonData) {
    const rates = taxData.socialSecurity;
    const taxForm = commonData.questions.pl.taxForm || 'General';
    let socialSecurityNote = "";
    let socialSecurity = 0;
    
    // Check for tax benefits
    const ulgaNaStart = commonData.taxBenefits.pl.ulgaNaStart || false;
    const malyZUSPlus = commonData.taxBenefits.pl.malyZUSPlus || false;
    const preferencyjneZUS = commonData.taxBenefits.pl.preferencyjneZUS || false;
    
    // Annual limit for pension and disability contributions (2024)
    const annualLimit = 234720; // 30 x average salary for pension and disability insurance
    
    // Determine contribution base
    let contributionBase = Math.max(totalIncome, rates.minContributionBase);
    
    // For Mały ZUS Plus, the contribution base is proportional to income
    // but not less than 30% of minimum wage
    if (malyZUSPlus) {
        const minWage2024 = 4242; // Minimum wage as of January 2024
        contributionBase = Math.max(0.3 * minWage2024, Math.min(0.6 * rates.minContributionBase, totalIncome));
        socialSecurityNote += "Mały ZUS Plus: Reduced contribution base";
    }
    
    // For preferential ZUS (first 24 months), the base is 30% of minimum wage
    if (preferencyjneZUS) {
        const minWage2024 = 4242; // Minimum wage as of January 2024
        contributionBase = 0.3 * minWage2024;
        socialSecurityNote += "Preferential ZUS: 30% of minimum wage as base";
    }
    
    // Calculate social security contributions
    let pensionAmount = 0;
    let disabilityAmount = 0;
    let sicknessAmount = 0;
    let accidentAmount = 0;
    let laborFundAmount = 0;
    
    // If not using "Ulga na Start" or it's expired, calculate social security
    if (!ulgaNaStart) {
        // Apply annual limit for pension and disability contributions
        const limitedBase = Math.min(contributionBase, annualLimit);
        
        // Pension and disability are subject to annual limit
        pensionAmount = limitedBase * rates.pension;
        disabilityAmount = limitedBase * rates.disability;
        
        // Sickness, accident, and labor fund are not subject to annual limit
        sicknessAmount = contributionBase * rates.sickness;
        accidentAmount = contributionBase * rates.accident;
        laborFundAmount = contributionBase * rates.laborFund;
        
        // Add note if annual limit is applied
        if (contributionBase > annualLimit) {
            if (socialSecurityNote) {
                socialSecurityNote += ". ";
            }
            socialSecurityNote += `Annual limit (${annualLimit} PLN) applied for pension and disability`;
        }
    } else {
        socialSecurityNote = "Ulga na Start: Exempt from social security (except health)";
    }
    
    // Calculate health insurance
    let healthBase = totalIncome;
    let healthRate = rates.healthGeneral; // Default 9%
    
    if (taxForm === 'Flat') {
        healthRate = rates.healthFlat; // 4.9% for flat tax
    }
    
    // Minimum health contribution based on minimum wage
    const minWage2024 = 4242; // Minimum wage as of January 2024
    const minHealthContribution = minWage2024 * rates.healthGeneral;
    
    // Health insurance has no upper limit
    let healthAmount = Math.max(minHealthContribution, healthBase * healthRate);
    
    // Sum up all contributions
    socialSecurity = pensionAmount + disabilityAmount + sicknessAmount + accidentAmount + laborFundAmount + healthAmount;
    
    // Add detailed breakdown to note
    if (socialSecurityNote) {
        socialSecurityNote += ". ";
    }
    
    socialSecurityNote += `Pension: ${Math.round(pensionAmount)}zł, ` +
                         `Disability: ${Math.round(disabilityAmount)}zł, ` +
                         `Sickness: ${Math.round(sicknessAmount)}zł, ` +
                         `Accident: ${Math.round(accidentAmount)}zł, ` +
                         `Labor Fund: ${Math.round(laborFundAmount)}zł, ` +
                         `Health: ${Math.round(healthAmount)}zł`;
    
    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
} 