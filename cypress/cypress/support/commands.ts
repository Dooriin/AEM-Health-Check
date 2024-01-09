// In your cypress/support/commands.ts

Cypress.Commands.overwrite('visit', (originalVisit, url, options) => {
  cy.clearCookies()
  cy.clearLocalStorage()
  originalVisit(url, options) // Do not return this call
})

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver loop limit exceeded error
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  // Return true for all other errors so that Cypress handles them
  return true;
});

