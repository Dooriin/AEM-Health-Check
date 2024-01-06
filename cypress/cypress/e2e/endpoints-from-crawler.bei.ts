import { CrawledData } from '../fixtures/crawledEndpoints'

describe('Endpoint Health Checks', () => {
  const endpoints = CrawledData.endpoints
  const failedAssets: string[] = []
  const failedPages: string[] = []
  const fileName = 'cypress/downloads/failedAssetsCrawler.txt'
  const pageFileName = 'cypress/downloads/failedPagesCrawler.txt'

  before(() => {
    cy.writeFile(fileName, '', { flag: 'w' })
    cy.writeFile(pageFileName, '', { flag: 'w' })
  })

  endpoints.forEach((url) => {
    it(`Validating page and assets for - ${url}`, () => {
      // Check if the URL is likely a non-HTML resource
      if (url.endsWith('.pdf')) {
        // Directly use cy.request for non-HTML resources
        cy.request({ url: url, failOnStatusCode: false }).then((response) => {
          if (response.status !== 200) {
            failedPages.push(
              `Failed Resource: ${url}, Status: ${response.status}`
            )
          }
        })
      } else {
        // Proceed with normal HTML page checks
        cy.request({ url: url, failOnStatusCode: false }).then(
          (pageResponse) => {
            if (pageResponse.status !== 200) {
              failedPages.push(
                `Failed Page: ${url}, Status: ${pageResponse.status}`
              )
            } else {
              cy.visit(url)
              cy.document()
                .then((document) => {
                  const assets = Array.from(
                    document.querySelectorAll(
                      'link[rel="stylesheet"], script[src]'
                    )
                  )
                    .map((el) =>
                      el.tagName === 'LINK'
                        ? (el as HTMLLinkElement).href
                        : (el as HTMLScriptElement).src
                    )
                    .filter(Boolean)

                  // Use Cypress.Promise.all to wait for all requests to complete
                  return Cypress.Promise.all(
                    assets.map((asset) => {
                      return cy
                        .request({ url: asset, failOnStatusCode: false })
                        .then((response) => {
                          if (response.status !== 200) {
                            failedAssets.push(
                              `Failed Asset: ${asset} from ${url}, Status: ${response.status}`
                            )
                          }
                        })
                    })
                  )
                })
                .then(() => {
                  // Assert at the end of the test
                  expect(failedAssets.length, `Failed assets for ${url}`).to.eq(
                    0
                  )
                })
            }
          }
        )
      }
    })
  })

  after(() => {
    // Write to files in the after hook
    if (failedPages.length > 0) {
      const pageLogContent = failedPages.join('\n')
      cy.writeFile(pageFileName, pageLogContent, { flag: 'a+' })
    }
    if (failedAssets.length > 0) {
      const assetLogContent = failedAssets.join('\n')
      cy.writeFile(fileName, assetLogContent, { flag: 'a+' })
    }
  })
})
