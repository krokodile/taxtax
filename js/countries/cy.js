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