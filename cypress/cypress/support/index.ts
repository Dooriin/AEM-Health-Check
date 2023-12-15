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
