// Portugal tax settings
export const taxData = {
    name: 'Portugal',
    flag: '🇵🇹',
    incomeTaxBrackets: [
        { threshold: 0, rate: 0.145 },
        { threshold: 7479, rate: 0.21 },
        { threshold: 11284, rate: 0.265 },
        { threshold: 15992, rate: 0.285 },
        { threshold: 20700, rate: 0.35 },
        { threshold: 25246, rate: 0.37 },
        { threshold: 36967, rate: 0.435 },
        { threshold: 48033, rate: 0.45 },
        { threshold: 75009, rate: 0.48 }
    ],
    questions: [
        { id: 'maritalStatus', label: 'Marital Status', type: 'segmented', common: true, options: [
            { value: 'Single', text: 'Single' },
            { value: 'Married', text: 'Married' }
        ]},
        { id: 'children', label: 'Number of Children', type: 'number', common: true },
        { id: 'nhrStatus', label: 'NHR Status', type: 'checkbox' },
        { id: 'ifici', label: 'IFICI', type: 'checkbox' }
    ]
}; 