/**
 * Utility functions for the Tax Calculator
 */

/**
 * Resets all data and UI components to their initial state
 * @param {Object} context - The global context with variables and functions
 */
export function resetData(context = window) {
    // Store current selected countries to properly deselect them
    const currentSelectedCountries = [...context.selectedCountries];
    
    // Reset global variables
    context.selectedCountries = [];
    
    // Properly deselect each country by calling toggleCountry for each currently selected country
    currentSelectedCountries.forEach(countryCode => {
        // We need to add them back temporarily for toggleCountry to work correctly
        context.selectedCountries.push(countryCode);
        context.toggleCountry(countryCode);
    });
    
    // Ensure the array is empty (in case toggleCountry didn't work as expected)
    context.selectedCountries = [];
    
    // Also manually remove active class from all country buttons
    document.querySelectorAll('.country-selector button').forEach(button => {
        button.classList.remove('active');
    });
    
    context.totalIncome = 0;

    // Clear results table
    context.resultsTable.innerHTML = '';
    
    // Reset all income type checkboxes and amounts
    document.querySelectorAll('input[type="checkbox"][id^="income-"]').forEach(checkbox => {
        checkbox.checked = false;
        
        // Get the corresponding amount input and reset it
        const incomeType = checkbox.dataset.incomeType;
        const amountInput = document.getElementById(`amount-${incomeType}`);
        if (amountInput) {
            amountInput.value = '0';
            amountInput.disabled = true;
            
            // Hide the amount input container
            const amountContainer = amountInput.closest('div');
            if (amountContainer) {
                amountContainer.style.visibility = 'hidden';
            }
        }
    });
    
    // Reset all tax benefit checkboxes
    document.querySelectorAll('#tax-benefits-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset all number inputs in the questions container
    document.querySelectorAll('#questions-container input[type="number"]').forEach(input => {
        input.value = '0';
    });
    
    // Reset all text inputs in the questions container
    document.querySelectorAll('#questions-container input[type="text"]').forEach(input => {
        input.value = '';
    });
    
    // Reset all checkboxes in the questions container
    document.querySelectorAll('#questions-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset all select elements in the questions container
    document.querySelectorAll('#questions-container select').forEach(select => {
        if (select.options.length > 0) {
            select.selectedIndex = 0;
        }
    });
    
    // Reset all segmented controls to first option
    document.querySelectorAll('.segmented-control').forEach(control => {
        const buttons = control.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (buttons.length > 0) {
            buttons[0].classList.add('active');
        }
    });
    
    // Reset years in business field
    const yearsInBusinessInput = document.getElementById('yearsInBusiness');
    if (yearsInBusinessInput) {
        yearsInBusinessInput.value = '';
    }
    
    // Reset additional info containers visibility
    document.querySelectorAll('td div[style*="visibility"]').forEach(div => {
        div.style.visibility = 'hidden';
    });
    
    // Hide questions and results sections
    const questionsHeader = document.getElementById('questions-header');
    const questionsContainer = document.getElementById('questions-container');
    const taxBenefitsHeader = document.getElementById('tax-benefits-header');
    const taxBenefitsContainer = document.getElementById('tax-benefits-container');
    
    if (questionsHeader) questionsHeader.classList.add('hidden');
    if (questionsContainer) questionsContainer.classList.add('hidden');
    if (taxBenefitsHeader) taxBenefitsHeader.classList.add('hidden');
    if (taxBenefitsContainer) taxBenefitsContainer.classList.add('hidden');
    
    // Re-render the UI components
    context.renderIncomeTypes();
    context.renderQuestions();
    context.renderTaxBenefits();
    
    // Disable calculate button since no countries are selected
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        calculateButton.disabled = true;
        calculateButton.style.opacity = '0.5';
    }
}

/**
 * Fills the form with test data for quick testing
 * @param {Object} context - The global context with variables and functions
 */
export function fillTestData(context = window) {
    // Start with a clean slate
    resetData(context);
    
    // Select all countries
    context.toggleCountry('fr');
    context.toggleCountry('es');
    context.toggleCountry('pt');
    context.toggleCountry('uk');
    context.toggleCountry('cy');

    // Set Sole Proprietorship income
    const soleProprietorshipCheckbox = document.getElementById('income-soleProprietorship');
    if (soleProprietorshipCheckbox) {
        soleProprietorshipCheckbox.checked = true;
        
        // Trigger the change event to show fields
        const changeEvent = new Event('change');
        soleProprietorshipCheckbox.dispatchEvent(changeEvent);
        
        // Set amount
        const soleProprietorshipAmount = document.getElementById('amount-soleProprietorship');
        if (soleProprietorshipAmount) {
            soleProprietorshipAmount.value = 80000;
            soleProprietorshipAmount.disabled = false;
        }
        
        // Set regime to Simplified Regime
        const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
        if (regimeControl) {
            const simplifiedButton = regimeControl.querySelector('button[value="Simplified Regime"]');
            if (simplifiedButton) {
                // Remove active class from all buttons
                regimeControl.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to the Simplified Regime button
                simplifiedButton.classList.add('active');
            }
        }
        
        // Set years in business to 1
        const yearsInBusinessInput = document.getElementById('yearsInBusiness');
        if (yearsInBusinessInput) {
            yearsInBusinessInput.value = 1;
        }
    }

    // Set marital status to Married (common question)
    const maritalStatus = document.getElementById('maritalStatus');
    if (maritalStatus) {
        // For segmented controls, find the "Married" button and click it
        const marriedButton = maritalStatus.querySelector('button[value="Married"]');
        if (marriedButton) {
            marriedButton.click();
        }
    }

    // Set number of children to 2 (common question)
    const children = document.getElementById('children');
    if (children) {
        children.value = 2;
    }
    
    // Select Beckham Law in Spain
    const beckhamLawCheckbox = document.getElementById('es-beckhamLaw');
    if (beckhamLawCheckbox) {
        beckhamLawCheckbox.checked = true;
    }
    
    // Select High-Skilled Resident in Cyprus
    const highSkilledResidentCheckbox = document.getElementById('cy-highSkilledResident');
    if (highSkilledResidentCheckbox) {
        highSkilledResidentCheckbox.checked = true;
    }

    // Scroll to calculate button
    const calculateButton = document.getElementById('calculate-button');
    calculateButton.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Saves the current state of the calculator to URL parameters
 * @param {Object} context - The global context with variables and functions
 * @returns {string} - The URL with parameters
 */
export function saveStateToURL(context = window) {
    const params = new URLSearchParams();
    
    // Save selected countries
    if (context.selectedCountries && context.selectedCountries.length > 0) {
        params.set('countries', context.selectedCountries.join(','));
    }
    
    // Save income types and amounts
    document.querySelectorAll('input[type="checkbox"][id^="income-"]').forEach(checkbox => {
        if (checkbox.checked) {
            const incomeType = checkbox.dataset.incomeType;
            params.set(`income_${incomeType}`, 'true');
            
            // Save amount if available
            const amountInput = document.getElementById(`amount-${incomeType}`);
            if (amountInput && amountInput.value) {
                params.set(`amount_${incomeType}`, amountInput.value);
            }
        }
    });
    
    // Save years in business for sole proprietorship
    const yearsInBusinessInput = document.getElementById('yearsInBusiness');
    if (yearsInBusinessInput && yearsInBusinessInput.value) {
        params.set('yearsInBusiness', yearsInBusinessInput.value);
    }
    
    // Save regime for PT sole proprietorship
    const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
    if (regimeControl) {
        const activeButton = regimeControl.querySelector('button.active');
        if (activeButton) {
            params.set('ptRegime', activeButton.value);
        }
    }
    
    // Save tax benefits
    document.querySelectorAll('#tax-benefits-container input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            params.set(checkbox.id, 'true');
        }
    });
    
    // Save common questions
    // Marital status
    const maritalStatus = document.getElementById('maritalStatus');
    if (maritalStatus) {
        const activeButton = maritalStatus.querySelector('button.active');
        if (activeButton) {
            params.set('maritalStatus', activeButton.value);
        }
    }
    
    // Number of children
    const children = document.getElementById('children');
    if (children && children.value) {
        params.set('children', children.value);
    }
    
    // Save country-specific questions
    context.selectedCountries.forEach(countryCode => {
        // Find all inputs with country prefix
        document.querySelectorAll(`[id^="${countryCode}-"]`).forEach(element => {
            // Skip tax benefits as they're already handled
            if (element.id.includes('beckhamLaw') || 
                element.id.includes('nhrStatus') || 
                element.id.includes('ifici') || 
                element.id.includes('blindPersonsAllowance') || 
                element.id.includes('highSkilledResident')) {
                return;
            }
            
            // Handle different input types
            if (element.tagName === 'INPUT') {
                if (element.type === 'checkbox') {
                    if (element.checked) {
                        params.set(element.id, 'true');
                    }
                } else if (element.type === 'number' || element.type === 'text') {
                    if (element.value) {
                        params.set(element.id, element.value);
                    }
                } else if (element.type === 'radio') {
                    if (element.checked) {
                        params.set(element.name, element.value);
                    }
                }
            } else if (element.tagName === 'SELECT') {
                if (element.value) {
                    params.set(element.id, element.value);
                }
            } else if (element.classList.contains('segmented-control')) {
                const activeButton = element.querySelector('button.active');
                if (activeButton) {
                    params.set(element.id, activeButton.value);
                }
            }
        });
    });
    
    // Save view mode
    const viewModeToggle = document.getElementById('view-mode-toggle');
    if (viewModeToggle) {
        params.set('view', viewModeToggle.checked ? 'detailed' : 'simple');
    }
    
    // Build the URL
    const url = new URL(window.location.href);
    url.search = params.toString();
    
    return url.toString();
}

/**
 * Copies the current state URL to clipboard and shows a notification
 * @param {Object} context - The global context with variables and functions
 */
export function copyStateURLToClipboard(context = window) {
    const url = saveStateToURL(context);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
        // Show notification
        showNotification('URL copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy URL: ', err);
        showNotification('Failed to copy URL', true);
    });
}

/**
 * Shows a temporary notification
 * @param {string} message - The message to display
 * @param {boolean} isError - Whether this is an error notification
 */
export function showNotification(message, isError = false) {
    // Remove any existing notification
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.textContent = message;
    notification.classList.add('notification');
    
    if (isError) {
        notification.classList.add('error');
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Wait for fade out animation
    }, 3000);
}

/**
 * Restores the calculator state from URL parameters
 * @param {Object} config - The configuration object with variables and functions
 */
export function restoreStateFromURL(config) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // First reset everything to ensure a clean state
    // Create a context object with the necessary properties for resetData
    const context = {
        selectedCountries: config.selectedCountries,
        totalIncome: config.totalIncome,
        resultsTable: config.resultsTable,
        toggleCountry: config.toggleCountry,
        ...config.renderCallbacks  // Spread the render callbacks
    };
    resetData(context);
    
    // Restore selected countries
    if (urlParams.has('countries')) {
        const countries = urlParams.get('countries').split(',');
        countries.forEach(countryCode => {
            if (!config.selectedCountries.includes(countryCode)) {
                config.toggleCountry(countryCode);
            }
        });
    }
    
    // Restore income types and amounts
    for (const [key, value] of urlParams.entries()) {
        if (key.startsWith('income_') && value === 'true') {
            const incomeType = key.replace('income_', '');
            const checkbox = document.getElementById(`income-${incomeType}`);
            if (checkbox) {
                checkbox.checked = true;
                
                // Trigger change event to show fields
                const changeEvent = new Event('change');
                checkbox.dispatchEvent(changeEvent);
                
                // Restore amount if available
                const amountKey = `amount_${incomeType}`;
                if (urlParams.has(amountKey)) {
                    const amountInput = document.getElementById(`amount-${incomeType}`);
                    if (amountInput) {
                        amountInput.value = urlParams.get(amountKey);
                        amountInput.disabled = false;
                    }
                }
            }
        }
    }
    
    // Restore years in business
    if (urlParams.has('yearsInBusiness')) {
        const yearsInBusinessInput = document.getElementById('yearsInBusiness');
        if (yearsInBusinessInput) {
            yearsInBusinessInput.value = urlParams.get('yearsInBusiness');
        }
    }
    
    // Restore regime for PT sole proprietorship
    if (urlParams.has('ptRegime')) {
        const regimeControl = document.getElementById('pt-ptSoleProprietorshipRegime');
        if (regimeControl) {
            const regimeValue = urlParams.get('ptRegime');
            const regimeButton = regimeControl.querySelector(`button[value="${regimeValue}"]`);
            if (regimeButton) {
                // Remove active class from all buttons
                regimeControl.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to the selected button
                regimeButton.classList.add('active');
            }
        }
    }
    
    // Restore tax benefits
    document.querySelectorAll('#tax-benefits-container input[type="checkbox"]').forEach(checkbox => {
        if (urlParams.has(checkbox.id) && urlParams.get(checkbox.id) === 'true') {
            checkbox.checked = true;
        }
    });
    
    // Restore common questions
    // Marital status
    if (urlParams.has('maritalStatus')) {
        const maritalStatus = document.getElementById('maritalStatus');
        if (maritalStatus) {
            const maritalValue = urlParams.get('maritalStatus');
            const maritalButton = maritalStatus.querySelector(`button[value="${maritalValue}"]`);
            if (maritalButton) {
                // Remove active class from all buttons
                maritalStatus.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to the selected button
                maritalButton.classList.add('active');
            }
        }
    }
    
    // Number of children
    if (urlParams.has('children')) {
        const children = document.getElementById('children');
        if (children) {
            children.value = urlParams.get('children');
        }
    }
    
    // Restore country-specific questions
    for (const [key, value] of urlParams.entries()) {
        // Skip already handled parameters
        if (key.startsWith('income_') || 
            key.startsWith('amount_') || 
            key === 'yearsInBusiness' || 
            key === 'ptRegime' || 
            key === 'maritalStatus' || 
            key === 'children' || 
            key === 'countries' || 
            key === 'view') {
            continue;
        }
        
        // Handle different input types
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'INPUT') {
                if (element.type === 'checkbox') {
                    element.checked = value === 'true';
                } else if (element.type === 'number' || element.type === 'text') {
                    element.value = value;
                }
            } else if (element.tagName === 'SELECT') {
                element.value = value;
            } else if (element.classList.contains('segmented-control')) {
                const button = element.querySelector(`button[value="${value}"]`);
                if (button) {
                    // Remove active class from all buttons
                    element.querySelectorAll('button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    // Add active class to the selected button
                    button.classList.add('active');
                }
            }
        }
        
        // Handle radio buttons (they use name attribute)
        if (key.includes('-') && !document.getElementById(key)) {
            const radioButtons = document.querySelectorAll(`input[type="radio"][name="${key}"]`);
            radioButtons.forEach(radio => {
                if (radio.value === value) {
                    radio.checked = true;
                }
            });
        }
    }
    
    // Restore view mode
    if (urlParams.has('view')) {
        const viewMode = urlParams.get('view');
        const viewModeToggle = document.getElementById('view-mode-toggle');
        
        if (viewMode === 'detailed' && !viewModeToggle.checked) {
            viewModeToggle.checked = true;
            viewModeToggle.dispatchEvent(new Event('change'));
        } else if (viewMode === 'simple' && viewModeToggle.checked) {
            viewModeToggle.checked = false;
            viewModeToggle.dispatchEvent(new Event('change'));
        }
    }
    
    // Calculate taxes if requested
    if (urlParams.has('calculate') && urlParams.get('calculate') === 'true') {
        setTimeout(() => {
            const calculateButton = document.getElementById('calculate-button');
            if (calculateButton) {
                calculateButton.click();
            }
        }, 500);
    }
} 