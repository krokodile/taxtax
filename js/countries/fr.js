// France tax settings
export const taxData = {
    name: 'France',
    flag: '🇫🇷',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0 },
        { threshold: 10778, rate: 0.11 },
        { threshold: 27478, rate: 0.30 },
        { threshold: 78571, rate: 0.41 },
        { threshold: 168994, rate: 0.45 }
    ],
    socialSecurity: {
        csg: 0.092,  // CSG rate
        crds: 0.005, // CRDS rate
        baseRate: 0.22 // Base social security rate
    },
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true }
    ]
}; 