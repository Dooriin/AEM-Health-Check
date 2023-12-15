Cypress.Commands.addAll({
  writeFileAsync(filename: string, content: string, options: {}) {
    return new Cypress.Promise((resolve) => {
      console.log('I made to this method')
      cy.writeFile(filename, content, options).then(() => {
        resolve(null)
      })
    })
  },
})
