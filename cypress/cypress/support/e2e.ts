// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// e2e.ts

// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific error messages
  if (
    err.message.includes('ttd_dom_ready') ||
    err.message.includes('WebForm_SaveScrollPositionSubmit is not defined') ||
    err.message.includes('ResizeObserver loop limit exceeded')
  ) {
    return false // Prevents Cypress from failing the test
  }
  return true // Throw error for other uncaught exceptions
})
