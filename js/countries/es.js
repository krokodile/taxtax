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