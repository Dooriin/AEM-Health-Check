import { CrawledData } from '../fixtures/crawledEndpoints'

describe('Endpoint Health Checks', () => {
  const endpoints = CrawledData.endpoints
  // Explicitly type the array to store strings
  const failedEndpoints: string[] = []

  before(() => {
    cy.writeFile('cypress/downloads/failedEndpoints.txt', '', { flag: 'w' })
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
      cy.writeFile(
        'cypress/downloads/postCrawl_failedEndpoints.txt',
        logContent,
        {
          flag: 'a+',
        }
      )
    }
  })
})
