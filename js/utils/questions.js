// questions.js - Contains all question definitions for the tax calculator

const questions = {
    maritalStatus: {
        label: "Marital Status:",
        type: "segmented",
        options: [
            { value: "single", text: "Single" },
            { value: "married", text: "Married (one income)" },
            { value: "married_two_incomes", text: "Married (two incomes)" },
        ],
        id: "maritalStatus" // Base ID
    },
    numChildren: {
        label: "Number of Children:",
        type: "number",
        id: "numChildren" // Base ID
    },
    soleProprietorshipRegime: {
        label: "Regime for Sole Proprietorship:",
        type: "segmented",
        options: [
          {value: "Simplified Regime", text: "Simplified Regime"},
          {value: "Organized Accounting", text: "Organized Accounting"}
        ],
        id: "ptSoleProprietorshipRegime" //base id
    },
    soleProprietorshipIncome: {
        label: "Sole Proprietorship Income",
        type: "number",
        id: "soleProprietorship" //base id
    },
    beckhamLaw: {
        label: "Applying Beckham's Law?",
        type: "checkbox",
        id: "beckhamLaw" //base id
    },
    nhrStatus: {
        label: "Applying NHR?",
        type: "checkbox",
        id: "nhrStatus" //base id
    },
    ifici: {
      label: "Applying IFICI?",
      type: "checkbox",
      id: "ifici" //base id
    },
    incomeType: { // Example: Income type selection for Portugal
        label: "Income Type:",
        type: "radio", //radio-buttons
        options: [
          { value: "employment", text: "Employment Income" },
          { value: "soleProprietorship", text: "Sole Proprietorship" }
        ],
        id: "incomeType" // Base ID
    }
};

const incomeTypes = {
    employment: { label: "Employment Income", country: ['pt', 'es', 'fr'] }, //all countries
    soleProprietorship: { label: "Sole Proprietorship Income", country: ['pt', 'es', 'fr'] }, //Portugal
    dividends: { label: "Dividends", country: ['pt', 'es', 'fr']},
    rental: { label: "Rental Income", country: ['pt', 'es', 'fr'] },
    capitalGains: {label: "Capital Gains", country: ['pt', 'es']}
    // Add other income types here
};

const countryQuestions = {
    pt: ["maritalStatus", "numChildren", "childcareExpenses", "incomeType", "nhrStatus", "ifici"],
    es: ["maritalStatus", "numChildren", "beckhamLaw"],
    fr: ["maritalStatus", "numChildren"], // Add questions for France later, if needed
};

export { questions, incomeTypes, countryQuestions }; 