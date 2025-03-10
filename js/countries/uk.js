// United Kingdom tax settings
export const taxData = {
    name: 'United Kingdom',
    flag: '🇬🇧',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },         // 0% up to personal allowance
        { threshold: 12570, rate: 0.20 },  // 20% basic rate
        { threshold: 50270, rate: 0.40 },  // 40% higher rate
        { threshold: 125140, rate: 0.45 }  // 45% additional rate
    ],
    socialSecurity: {
        primaryThreshold: 12570,      // Primary threshold
        upperEarningsLimit: 50270,    // Upper earnings limit
        primaryRate: 0.12,           // 12% between primary threshold and upper earnings limit
        upperRate: 0.02             // 2% above upper earnings limit
    },
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'blindPersonsAllowance', label: 'Blind Person\'s Allowance', type: 'checkbox', 
          description: 'Additional £3,070 allowance for registered blind persons' }
    ]
};

export function calculateIncomeTaxUK(taxableBase, adjustedPersonalAllowance) {
    // Adjust tax brackets to account for the adjusted personal allowance
    const adjustedBrackets = [...taxData.incomeTaxBrackets];
    adjustedBrackets[1].threshold = adjustedPersonalAllowance;
    
    return calculateIncomeTax(taxableBase, adjustedBrackets);
}

export function calculateSocialSecurityUK(totalIncome) {
    const rates = taxData.socialSecurity;
    let socialSecurityNote = "";
    
    // Calculate National Insurance contributions
    let niContribution = 0;
    
    // No NI on income below primary threshold
    if (totalIncome <= rates.primaryThreshold) {
        socialSecurityNote = "Below primary threshold - no National Insurance due";
    } else {
        // Calculate NI on income between primary threshold and upper earnings limit
        const middleBandIncome = Math.min(totalIncome, rates.upperEarningsLimit) - rates.primaryThreshold;
        if (middleBandIncome > 0) {
            const middleBandNI = middleBandIncome * rates.primaryRate;
            niContribution += middleBandNI;
            socialSecurityNote = `${(rates.primaryRate * 100).toFixed(0)}% on £${rates.primaryThreshold.toLocaleString()} to £${Math.min(totalIncome, rates.upperEarningsLimit).toLocaleString()}: £${Math.round(middleBandNI).toLocaleString()}`;
        }
        
        // Calculate NI on income above upper earnings limit
        if (totalIncome > rates.upperEarningsLimit) {
            const upperBandIncome = totalIncome - rates.upperEarningsLimit;
            const upperBandNI = upperBandIncome * rates.upperRate;
            niContribution += upperBandNI;
            socialSecurityNote += `, ${(rates.upperRate * 100).toFixed(0)}% on income above £${rates.upperEarningsLimit.toLocaleString()}: £${Math.round(upperBandNI).toLocaleString()}`;
        }
    }
    
    return { socialSecurity: niContribution.toFixed(2), socialSecurityNote };
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