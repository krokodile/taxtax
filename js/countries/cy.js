// Cyprus tax settings
export const taxData = {
    name: 'Cyprus',
    flag: '🇨🇾',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },         // 0% up to €19,500
        { threshold: 19500, rate: 0.20 },  // 20% from €19,501 to €28,000
        { threshold: 28000, rate: 0.25 },  // 25% from €28,001 to €36,300
        { threshold: 36300, rate: 0.30 },  // 30% from €36,301 to €60,000
        { threshold: 60000, rate: 0.35 }   // 35% over €60,000
    ],
    socialSecurity: {
        employeeRate: 0.083, // 8.3% for employee
        maxContributionBase: 4840 * 12 // Monthly ceiling of €4,840 (annual: €58,080)
    },
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'highSkilledResident', label: 'High-Skilled Resident', type: 'checkbox', 
          description: 'Exemption of 50% of income for high-skilled professionals' }
    ]
}; 

export function calculateIncomeTaxCY(taxableBase, highSkilledResident) {
    // Cyprus has a progressive tax system
    // For high-skilled residents, 50% of income is exempt from tax
    
    let effectiveTaxableBase = highSkilledResident ? taxableBase * 0.5 : taxableBase;
    
    // Cyprus tax brackets for 2024
    const cyTaxBrackets = [
        { threshold: 0, rate: 0 },         // 0% up to €19,500
        { threshold: 19500, rate: 0.20 },  // 20% from €19,501 to €28,000
        { threshold: 28000, rate: 0.25 },  // 25% from €28,001 to €36,300
        { threshold: 36300, rate: 0.30 },  // 30% from €36,301 to €60,000
        { threshold: 60000, rate: 0.35 }   // 35% over €60,000
    ];
    
    // Calculate tax using the generic function
    const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTax(effectiveTaxableBase, cyTaxBrackets);
    
    // Add note about high-skilled resident exemption if applicable
    if (highSkilledResident) {
        incomeTaxDetails.unshift({
            rate: 0,
            taxableAmount: (taxableBase * 0.5).toFixed(2),
            taxAmount: "0.00"
        });
    }
    
    return { totalIncomeTax, incomeTaxDetails };
}

export function calculateSocialSecurityCY(totalIncome) {
    // Cyprus social security rates for 2024
    const employeeRate = 0.083; // 8.3% for employee
    const maxContributionBase = 4840 * 12; // Monthly ceiling of €4,840 (annual: €58,080)
    
    let taxableBase = totalIncome;
    let socialSecurityNote = "";
    
    // Apply ceiling if income exceeds maximum contribution base
    if (taxableBase > maxContributionBase) {
        taxableBase = maxContributionBase;
        socialSecurityNote = "Ceiling Reached";
    }
    
    // Calculate social security contribution
    const socialSecurity = taxableBase * employeeRate;
    
    return { 
        socialSecurity: socialSecurity.toFixed(2), 
        socialSecurityNote: socialSecurityNote ? socialSecurityNote : `${(employeeRate * 100).toFixed(1)}% of income` 
    };
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