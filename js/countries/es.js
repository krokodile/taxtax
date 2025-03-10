// Spain tax settings
export const taxData = {
    name: 'Spain',
    flag: '🇪🇸',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0.19 },
        { threshold: 12450, rate: 0.24 },
        { threshold: 20200, rate: 0.30 },
        { threshold: 35200, rate: 0.37 },
        { threshold: 60000, rate: 0.45 },
        { threshold: 300000, rate: 0.47 }
    ],
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'beckhamLaw', label: "Beckham's Law", type: 'checkbox' }
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

export function calculateIncomeTaxES(taxableBase, beckhamLaw) {
    if (beckhamLaw) {
        // Beckham Law: Flat rate (24% up to 600,000, 47% above)
        let totalIncomeTax = 0;
        const incomeTaxDetails = [];

        if (taxableBase <= 600000) {
            totalIncomeTax = taxableBase * 0.24;
            incomeTaxDetails.push({
                rate: 0.24,
                taxableAmount: taxableBase.toFixed(2),
                taxAmount: totalIncomeTax.toFixed(2)
            });
        } else {
            totalIncomeTax = 600000 * 0.24;
            incomeTaxDetails.push({
                rate: 0.24,
                taxableAmount: "600000.00",
                taxAmount: totalIncomeTax.toFixed(2)
            });
            totalIncomeTax += (taxableBase - 600000) * 0.47;
            incomeTaxDetails.push({
                rate: 0.47,
                taxableAmount: (taxableBase - 600000).toFixed(2),
                taxAmount: ((taxableBase - 600000) * 0.47).toFixed(2)
            });
        }

        return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
    } else {
        // Standard Progressive Tax Calculation for Spain
        return calculateIncomeTax(taxableBase, taxData.incomeTaxBrackets);
    }
}

export function calculateSocialSecurityES(totalIncome, commonData) {
    // Use the common hasSoleProprietorship flag instead of Spain-specific isAutonomo
    const isAutonomo = commonData.hasSoleProprietorship || false;
    // Use the common yearsInBusiness field instead of Spain-specific firstYearAutonomo
    const firstYearAutonomo = commonData.yearsInBusiness === 1;
    let socialSecurityNote = "";
    
    if (isAutonomo) {
        // Calculate net monthly income (assuming 20% expenses for simplification)
        // In a real implementation, you would use actual expenses
        const netMonthlyIncome = (totalIncome * 0.8) / 12;
        
        let monthlyContribution = 0;
        
        if (firstYearAutonomo) {
            // Fixed rate for the first year
            monthlyContribution = 230;
            socialSecurityNote = "First year autónomo flat rate: 230€/month";
        } else {
            // Progressive scale based on net monthly income for 2025
            if (netMonthlyIncome <= 670) {
                monthlyContribution = 225;
            } else if (netMonthlyIncome <= 900) {
                monthlyContribution = 250;
            } else if (netMonthlyIncome <= 1166) {
                monthlyContribution = 267;
            } else if (netMonthlyIncome <= 1300) {
                monthlyContribution = 291;
            } else if (netMonthlyIncome <= 1700) {
                monthlyContribution = 294;
            } else if (netMonthlyIncome <= 1850) {
                monthlyContribution = 320;
            } else if (netMonthlyIncome <= 2030) {
                monthlyContribution = 325;
            } else if (netMonthlyIncome <= 2330) {
                monthlyContribution = 330;
            } else if (netMonthlyIncome <= 2760) {
                monthlyContribution = 340;
            } else if (netMonthlyIncome <= 3190) {
                monthlyContribution = 360;
            } else if (netMonthlyIncome <= 3620) {
                monthlyContribution = 380;
            } else if (netMonthlyIncome <= 4050) {
                monthlyContribution = 400;
            } else if (netMonthlyIncome <= 6000) {
                monthlyContribution = 450;
            } else {
                monthlyContribution = 530;
            }
            
            socialSecurityNote = `Autónomo contribution based on net monthly income: ${netMonthlyIncome.toFixed(2)}€`;
        }
        
        const annualContribution = monthlyContribution * 12;
        return { socialSecurity: annualContribution.toFixed(2), socialSecurityNote };
    } else {
        // Original calculation for employed individuals
        const monthlyCeiling = 4720.50;  // Monthly ceiling for 2024
        const rate = 0.0635;          // Combined rate (simplified)

        let monthlyTaxableBase = totalIncome / 12; // Calculate monthly base

        if (monthlyTaxableBase > monthlyCeiling) {
            monthlyTaxableBase = monthlyCeiling;
            socialSecurityNote = "Ceiling Reached";
        }
        //No floor implementation
        const monthlyContribution = monthlyTaxableBase * rate;
        const annualContribution = monthlyContribution * 12;

        return { socialSecurity: annualContribution.toFixed(2), socialSecurityNote };
    }
} 