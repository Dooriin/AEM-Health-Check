// cypress/support/endpointChecks.ts

export const checkEndpointsAndResources = (
  endpoints: string[],
  endpointFileName: string,
  resourceFileName: string
): void => {
  const failedEndpoints: string[] = []
  const failedResources: string[] = []

  const checkResourceStatus = (resources: string[]): void => {
    resources.forEach((url) => {
      cy.request({
        url: url,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          failedResources.push(
            `Failed Resource: ${url}, Status: ${response.status}`
          )
        }
      })
    })
  }

  before(() => {
    cy.writeFile(endpointFileName, '', { flag: 'w' })
    cy.writeFile(resourceFileName, '', { flag: 'w' })
  })

  endpoints.forEach((url) => {
    it(`Validating - ${url}`, () => {
      cy.request({
        url: url,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          failedEndpoints.push(
            `Failed Endpoint: ${url}, Status: ${response.status}`
          )
        }
        expect(response.status).to.eq(200)

        // Extract and check resources if it's an HTML response
        if (response.headers['content-type'].includes('text/html')) {
          const html = document.createElement('html')
          html.innerHTML = response.body
          let resources: string[] = []
          html.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            resources.push(link.getAttribute('href'))
          })
          html.querySelectorAll('script[src]').forEach((script) => {
            resources.push(script.getAttribute('src'))
          })
          checkResourceStatus(resources)
        }
      })
    })
  })

  after(() => {
    if (failedEndpoints.length > 0) {
      const logContent = failedEndpoints.join('\n')
      cy.writeFile(endpointFileName, logContent, { flag: 'a+' })
    }
    if (failedResources.length > 0) {
      const logResourceContent = failedResources.join('\n')
      cy.writeFile(resourceFileName, logResourceContent, { flag: 'a+' })
    }
  })
}
