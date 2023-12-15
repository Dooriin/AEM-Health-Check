import { EndpointsV3 } from '../fixtures/endpoints_V3'

describe('Endpoint Health Checks', () => {
  const endpoints = EndpointsV3.endpoints
  // Explicitly type the array to store strings
  const failedEndpoints: string[] = []
  const fileName = 'cypress/downloads/failedEndpointsV3.txt'

  before(() => {
    cy.writeFile(fileName, '', { flag: 'w' })
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
      })
    })
  })

  after(() => {
    if (failedEndpoints.length > 0) {
      const logContent = failedEndpoints.join('\n')
      cy.writeFile(fileName, logContent, {
        flag: 'a+',
      })
    }
  })
})
