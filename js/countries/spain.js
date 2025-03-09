// spain.js - Contains tax data and calculation functions for Spain

const spainData = {
    name: "Spain",
    incomeTaxBrackets: [
        { threshold: 0, rate: 0.19 },
        { threshold: 12450, rate: 0.24 },
        { threshold: 20200, rate: 0.30 },
        { threshold: 35200, rate: 0.37 },
        { threshold: 60000, rate: 0.45 },
        { threshold: 300000, rate: 0.47 }
    ],
    socialSecurity: {
        generalRate: 0.0635, // Combined, simplified
        ceiling: 4720.50 * 12,
    },
    questions: [
        { id: "maritalStatus", label: "Marital Status", type: "segmented", options: [
            { value: "Single", text: "Single" },
            { value: "Married", text: "Married" },
            { value: "Separated", text: "Separated" },
            { value: "Divorced", text: "Divorced" },
            { value: "Widowed", text: "Widowed" }
        ], common: true },
        { id: "children", label: "Number of Children", type: "number", common: true },
        { id: "beckhamLaw", label: "Applying Beckham's Law?", type: "checkbox", common: false },
    ],
    incomeTypes: [
        { id: "employment", label: "Employment" },
        { id: "soleProprietorship", label: "Sole Proprietorship" },
        { id: "dividends", label: "Dividends" },
        { id: "rental", label: "Rental Income" },
        { id: "capitalGains", label: "Capital Gains" }
    ]
};

// Calculate Spanish income tax
function calculateIncomeTax(taxableBase, beckhamLaw) {
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
                taxableAmount: 600000,
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
        const incomeTaxDetails = [];
        let totalIncomeTax = 0;
        let remainingIncome = taxableBase;
        let previousThreshold = 0;

        spainData.incomeTaxBrackets.forEach(bracket => {
            const taxableAtThisRate = Math.max(0, Math.min(remainingIncome, bracket.threshold - previousThreshold));
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
            previousThreshold = bracket.threshold;
        });

        return { totalIncomeTax: totalIncomeTax.toFixed(2), incomeTaxDetails };
    }
}

// Calculate Spanish social security
function calculateSocialSecurity(totalIncome) {
    const monthlyCeiling = 4720.50;  // Monthly ceiling for 2024
    const rate = spainData.socialSecurity.generalRate;
    let socialSecurityNote = "";

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

// Main calculation function for Spain
function calculateTaxes(totalIncome) {
    const results = {};
    
    results.taxableBase = totalIncome;
    
    // Get Beckham Law status
    const beckhamLaw = document.getElementById('es-beckhamLaw')?.checked || false;
    
    // Calculate income tax
    const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTax(results.taxableBase, beckhamLaw);
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

export { spainData, calculateTaxes }; 