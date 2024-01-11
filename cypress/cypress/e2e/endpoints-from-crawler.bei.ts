import { CrawledData } from '../fixtures/crawledEndpoints'

describe('Endpoint Health Checks', () => {
  const endpoints = CrawledData.endpoints
  const allFailedAssets: string[] = [] // Global array to track all failed assets
  const failedPages: string[] = []
  const fileName = 'cypress/downloads/failedAssetsV3.txt'
  const pageFileName = 'cypress/downloads/failedPagesV3.txt'
  // Asset verification flags
  const verifyCSS = true
  const verifyJS = true
  const verifyLogo = true // Logos are typically .svg files
  const verifyImages = true // All known image formats
  const allLogs: string[] = []

  function customLog(message: string) {
    allLogs.push(message)
    cy.log(message)
  }

  before(() => {
    cy.writeFile(fileName, '', { flag: 'w' })
    cy.writeFile(pageFileName, '', { flag: 'w' })
  })

  endpoints.forEach((url) => {
    it(`Validating page and assets for - ${url}`, () => {
      if (url.endsWith('.pdf')) {
        cy.log(`Skipping PDF endpoint: ${url}`)
        customLog(`Skipping PDF endpoint: ${url}`)

        return
      }

      const failedAssets: any = [] // Local array for this test

      cy.request({ url, failOnStatusCode: false }).then((pageResponse) => {
        if (pageResponse.status !== 200) {
          failedPages.push(
            `Failed Page: ${url}, Status: ${pageResponse.status}`
          )
        } else {
          cy.visit(url)
          cy.document()
            .then((document) => {
              const assets = Array.from(
                document.querySelectorAll('link, script, img')
              )
                .map((el) => {
                  let assetUrl = ''

                  if (
                    verifyCSS &&
                    el.tagName === 'LINK' &&
                    el.getAttribute('rel') === 'stylesheet'
                  ) {
                    assetUrl = (el as HTMLLinkElement).href
                  } else if (
                    verifyJS &&
                    el.tagName === 'SCRIPT' &&
                    el.getAttribute('src')
                  ) {
                    assetUrl = (el as HTMLScriptElement).src
                  } else if (el.tagName === 'IMG') {
                    const src = (el as HTMLImageElement).src

                    if (
                      (verifyLogo && src.endsWith('.svg')) ||
                      (verifyImages &&
                        (src.endsWith('.png') ||
                          src.endsWith('.jpg') ||
                          src.endsWith('.jpeg') ||
                          src.endsWith('.gif')))
                    ) {
                      assetUrl = src
                    }
                  }

                  // If the asset URL is relative (does not start with 'http'), prepend the base URL of the current page
                  if (assetUrl && !assetUrl.startsWith('http')) {
                    assetUrl = new URL(assetUrl, url).href
                  }

                  return assetUrl
                })
                .filter(Boolean)

              if (assets.length === 0) {
                customLog(`No assets found for URL: ${url}`)
                cy.log(`No assets found for URL: ${url}`)
              } else {
                assets.forEach((asset) => {
                  customLog(`Checking asset: ${asset} for ${url}`)

                  cy.log(`Checking asset: ${asset} for ${url}`)
                })

                return Cypress.Promise.all(
                  assets.map((asset) => {
                    if (asset) {
                      // Ensures only non-null, non-undefined values are used
                      return cy
                        .request({ url: asset, failOnStatusCode: false })
                        .then((response) => {
                          if (response.status !== 200) {
                            const errorMessage = `Failed Asset: ${asset} from ${url}, Status: ${response.status}`
                            failedAssets.push(errorMessage)
                            cy.log(errorMessage) // Log the error message
                          }
                        })
                    }
                  })
                )
              }
            })
            .then(() => {
              allFailedAssets.push(...failedAssets) // Add local failures to global array
              expect(failedAssets.length, `Failed assets for ${url}`).to.eq(0)
            })
        }
      })
    })
  })

  after(() => {
    cy.writeFile('cypress/downloads/testLogs.txt', allLogs.join('\n'), {
      flag: 'w+',
    })

    // Writing to files in the after hook
    if (failedPages.length > 0) {
      const pageLogContent = failedPages.join('\n')
      cy.writeFile(pageFileName, pageLogContent, { flag: 'a+' })
    }
    if (allFailedAssets.length > 0) {
      const assetLogContent = allFailedAssets.join('\n')
      cy.writeFile(fileName, assetLogContent, { flag: 'a+' })
    }
  })
})
