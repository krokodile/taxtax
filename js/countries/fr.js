// French tax settings
export const taxData = {
    name: 'France',
    flag: '🇫🇷',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },         // 0% up to €10,777
        { threshold: 10778, rate: 0.11 },  // 11% from €10,778 to €27,478
        { threshold: 27479, rate: 0.30 },  // 30% from €27,479 to €78,570
        { threshold: 78571, rate: 0.41 },  // 41% from €78,571 to €168,994
        { threshold: 168995, rate: 0.45 }  // 45% over €168,994
    ],
    socialSecurity: {
        baseRate: 0.22,    // 22% base rate for self-employed
        csg: 0.092,        // 9.2% CSG
        crds: 0.005        // 0.5% CRDS
    },
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true }
    ]
};

export function calculateIncomeTaxFR(totalIncome, familyQuotient) {
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

    // Calculate tax per part
    const taxablePerPart = totalIncome / familyQuotient;
    const { totalIncomeTax: taxPerPart, incomeTaxDetails } = calculateIncomeTax(taxablePerPart, taxData.incomeTaxBrackets);

    // Multiply back by number of parts to get final tax
    const finalTax = (parseFloat(taxPerPart) * familyQuotient).toFixed(2);
    const scaledDetails = incomeTaxDetails.map(detail => ({
        ...detail,
        taxableAmount: (parseFloat(detail.taxableAmount) * familyQuotient).toFixed(2),
        taxAmount: (parseFloat(detail.taxAmount) * familyQuotient).toFixed(2)
    }));

    return { totalIncomeTax: finalTax, incomeTaxDetails: scaledDetails };
}

export function calculateSocialSecurityFR(totalIncome, yearsInBusiness = 0, hasSoleProprietorship = false) {
    const rates = taxData.socialSecurity;
    let socialSecurityNote = "";
    
    // Constants for 2024
    const PASS = 43992; // Plafond Annuel de la Sécurité Sociale 2024
    const CSG_CRDS_BASE = 0.9825; // CSG and CRDS are calculated on 98.25% of income
    
    // Calculate CSG and CRDS (on 98.25% of total income)
    const csgCrdsBase = totalIncome * CSG_CRDS_BASE;
    const csgAmount = csgCrdsBase * rates.csg;
    const crdsAmount = csgCrdsBase * rates.crds;
    
    // Determine the appropriate rate based on income type
    // For employment income, use employee part only (around 8%)
    // For sole proprietorship, use the full rate (22%)
    const effectiveRate = hasSoleProprietorship ? rates.baseRate : 0.08;
    
    // Calculate base social security with PASS ceiling
    let baseAmount;
    if (totalIncome > PASS) {
        baseAmount = PASS * effectiveRate;
        socialSecurityNote = `Base capped at PASS (${PASS}€)`;
    } else {
        baseAmount = totalIncome * effectiveRate;
    }
    
    // Calculate initial social security amount
    let socialSecurity = csgAmount + crdsAmount + baseAmount;
    
    // Add detailed breakdown to note
    socialSecurityNote = `CSG (${(rates.csg * 100).toFixed(1)}%): ${Math.round(csgAmount)}€, ` +
                        `CRDS (${(rates.crds * 100).toFixed(1)}%): ${Math.round(crdsAmount)}€, ` +
                        `Base (${(effectiveRate * 100).toFixed(1)}%): ${Math.round(baseAmount)}€ ` +
                        (totalIncome > PASS ? `(capped at PASS: ${PASS}€)` : "");
    
    // Apply ACRE reduction only for the first year of sole proprietorship
    if (hasSoleProprietorship && yearsInBusiness === 1) {
        const discount = 0.50; // 50% reduction in first year only
        // Apply discount only to base amount, not to CSG/CRDS
        const discountedBase = baseAmount * (1 - discount);
        socialSecurity = csgAmount + crdsAmount + discountedBase;
        socialSecurityNote += ` (ACRE: 50% first year reduction on base contributions)`;
    }
    
    return { socialSecurity: socialSecurity.toFixed(2), socialSecurityNote };
} 