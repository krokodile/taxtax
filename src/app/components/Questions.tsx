'use client';

import React, { FC, useState } from 'react';

interface QuestionOption {
  value: string;
  text: string;
}

interface BaseQuestion {
  id: string;
  label: string;
  type: string;
}

interface SelectQuestion extends BaseQuestion {
  type: 'select';
  options: QuestionOption[];
}

interface NumberQuestion extends BaseQuestion {
  type: 'number';
}

interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
}

type Question = SelectQuestion | NumberQuestion | CheckboxQuestion;

// Define questions for each country
const questions: Record<string, Question> = {
  residencyStatus: {
    id: "residencyStatus",
    label: "Are you a tax resident?",
    type: "select",
    options: [
      { value: "resident", text: "Yes" },
      { value: "nonResident", text: "No" }
    ]
  },
  yearsInCountry: {
    id: "yearsInCountry",
    label: "Years in the country",
    type: "number"
  },
  maritalStatus: {
    id: "maritalStatus",
    label: "Marital status",
    type: "select",
    options: [
      { value: "single", text: "Single" },
      { value: "married", text: "Married" },
      { value: "divorced", text: "Divorced" },
      { value: "widowed", text: "Widowed" }
    ]
  }
};

// Define which questions apply to which countries
const countryQuestions = {
  pt: ["residencyStatus", "yearsInCountry", "maritalStatus"],
  es: ["residencyStatus", "maritalStatus"],
  fr: ["residencyStatus", "maritalStatus"],
  uk: ["residencyStatus", "yearsInCountry"],
  cy: ["residencyStatus", "yearsInCountry"]
};

interface QuestionsProps {
  selectedCountries: string[];
}

const Questions: FC<QuestionsProps> = ({ selectedCountries }) => {
  const [questionValues, setQuestionValues] = useState<Record<string, Record<string, string | number | boolean>>>({});

  const handleQuestionChange = (country: string, questionId: string, value: string | number | boolean) => {
    setQuestionValues(prev => ({
      ...prev,
      [country]: {
        ...(prev[country] || {}),
        [questionId]: value
      }
    }));
  };

  return (
    <div id="questions-container">
      {selectedCountries.map(country => {
        const countryQuestionIds = countryQuestions[country as keyof typeof countryQuestions];
        if (!countryQuestionIds || countryQuestionIds.length === 0) return null;
        
        return (
          <div key={country} className="country-questions">
            <h3>{country.toUpperCase()} Questions</h3>
            {countryQuestionIds.map(questionId => {
              const question = questions[questionId as keyof typeof questions];
              if (!question) return null;
              
              return (
                <div key={`${country}-${question.id}`} className="question">
                  <label htmlFor={`${country}-${question.id}`}>{question.label}</label>
                  
                  {question.type === 'select' && question.options && (
                    <select
                      id={`${country}-${question.id}`}
                      value={questionValues[country]?.[question.id] as string || ''}
                      onChange={(e) => handleQuestionChange(country, question.id, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {question.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {question.type === 'number' && (
                    <input
                      type="number"
                      id={`${country}-${question.id}`}
                      value={questionValues[country]?.[question.id] as number || ''}
                      onChange={(e) => handleQuestionChange(country, question.id, Number(e.target.value))}
                      min="0"
                    />
                  )}
                  
                  {question.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      id={`${country}-${question.id}`}
                      checked={questionValues[country]?.[question.id] as boolean || false}
                      onChange={(e) => handleQuestionChange(country, question.id, e.target.checked)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Questions; 