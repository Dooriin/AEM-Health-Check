import './commands'

declare namespace Cypress {
  interface Chainable<> {
    /**
     * Custom command to write data to a file asynchronously.
     * @example cy.writeFileAsync('path/to/file.txt', 'Hello, world!')
     */
    writeFileAsync(
      filename: string,
      content: string,
      options: {}
    ): Chainable<void>
  }
}

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific error messages
  if (
    err.message.includes('WebForm_SaveScrollPositionSubmit is not defined') ||
    err.message.includes('ResizeObserver loop limit exceeded')
  ) {
    return false // Prevents Cypress from failing the test
  }

  return true // Throw error for other uncaught exceptions
})
