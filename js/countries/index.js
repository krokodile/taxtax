// Export all country tax data
import { taxData as frTaxData } from './fr.js';
import { taxData as esTaxData } from './es.js';
import { taxData as ptTaxData } from './pt.js';
import { taxData as ukTaxData } from './uk.js';
import { taxData as cyTaxData } from './cy.js';

export const taxData = {
    fr: frTaxData,
    es: esTaxData,
    pt: ptTaxData,
    uk: ukTaxData,
    cy: cyTaxData
}; 