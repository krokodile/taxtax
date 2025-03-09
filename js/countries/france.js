// france.js - Contains tax data and calculation functions for France

const franceData = {
    name: "France",
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },
        { threshold: 11294, rate: 0.11 },
        { threshold: 28797, rate: 0.30 },
        { threshold: 82341, rate: 0.41 },
        { threshold: 177106, rate: 0.45 }
    ],
    socialSecurity: {
        generalRate: 0.0, // Simplified. France has many.
        ceiling: Infinity,
    },
    questions: [
        { id: "maritalStatus", label: "Marital Status", type: "segmented", options: [
            { value: "Single", text: "Single" },
            { value: "Married", text: "Married" },
            { value: "PACS", text: "PACS" },
            { value: "Divorced", text: "Divorced" },
            { value: "Widowed", text: "Widowed" }
        ], common: true },
        { id: "children", label: "Number of Children", type: "number", common: true },
        { id: "yearsInBusiness", label: "Years in Business (Sole Proprietorship)", type: "number", common: false, dependsOn: "incomeTypes", dependencyValue: "soleProprietorship" }
    ],
    incomeTypes: [
        { id: "employment", label: "Employment" },
        { id: "soleProprietorship", label: "Sole Proprietorship" },
        { id: "dividends", label: "Dividends" },
        { id: "rental", label: "Rental Income" }
    ]
};

// Calculate French income tax
function calculateIncomeTax(taxableBase) {
    const incomeTaxDetails = [];
    let totalIncomeTax = 0;
    let remainingIncome = taxableBase;

    franceData.incomeTaxBrackets.forEach((bracket, index) => {
        const nextThreshold = index < franceData.incomeTaxBrackets.length - 1 ? franceData.incomeTaxBrackets[index + 1].threshold : Infinity;
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

// Calculate French social security
function calculateSocialSecurity(totalIncome, yearsInBusiness = 0) {
    // Simplified French Social Security (using URSSAF general rate)
    const rate = franceData.socialSecurity.generalRate;
    let socialSecurityNote = ""; // Could add notes for specific cases if needed
    
    // Apply discount based on years in business if it's a sole proprietorship
    if (document.getElementById('income-soleProprietorship')?.checked && yearsInBusiness > 0) {
        socialSecurityNote = `Years in Business: ${yearsInBusiness}`;
        // You can add specific calculations based on yearsInBusiness here
    }
    
    const socialSecurity = totalIncome * rate;

    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
}

// Main calculation function for France
function calculateTaxes(totalIncome) {
    const results = {};
    
    // For France, use the yearsInBusiness field if it exists
    const yearsInBusiness = parseInt(document.getElementById('fr-yearsInBusiness')?.value || 0);
    results.taxableBase = totalIncome; // For now, just use totalIncome as the taxable base
    
    // You can add specific calculations for France based on yearsInBusiness here
    if (yearsInBusiness > 0) {
        results.taxRegimeNote = `Years in Business: ${yearsInBusiness}`;
    }

    // Calculate income tax
    const { totalIncomeTax, incomeTaxDetails } = calculateIncomeTax(results.taxableBase);
    results.incomeTax = totalIncomeTax;
    results.incomeTaxDetails = incomeTaxDetails;

    // Calculate social security
    const { socialSecurity, socialSecurityNote } = calculateSocialSecurity(totalIncome, yearsInBusiness);
    results.socialSecurity = socialSecurity;
    results.socialSecurityNote = socialSecurityNote;

    // Final calculations
    results.totalDeductions = parseFloat(results.incomeTax) + parseFloat(results.socialSecurity);
    results.netIncome = totalIncome - results.totalDeductions;
    results.effectiveTaxRate = ((results.totalDeductions / totalIncome) * 100).toFixed(2);

    return results;
}

export { franceData, calculateTaxes }; 