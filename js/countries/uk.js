// United Kingdom tax settings
export const taxData = {
    name: 'United Kingdom',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },
        { threshold: 12570, rate: 0.20 },
        { threshold: 50270, rate: 0.40 },
        { threshold: 125140, rate: 0.45 }
    ],
    socialSecurity: {
        primaryThreshold: 12570,  // Primary threshold for National Insurance
        upperEarningsLimit: 50270, // Upper earnings limit
        primaryRate: 0.08,        // 8% rate between primary threshold and upper earnings limit
        upperRate: 0.02           // 2% rate above upper earnings limit
    },
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'blindPersonsAllowance', label: 'Blind Person\'s Allowance', type: 'checkbox' }
    ]
}; 