import { EndpointsV3 } from '../fixtures/endpoints_V3'

describe('Endpoint Health Checks', () => {
  const endpoints = EndpointsV3.endpoints
  const failedAssets: string[] = []
  const failedPages: string[] = []
  const fileName = 'cypress/downloads/failedAssetsV3.txt'
  const pageFileName = 'cypress/downloads/failedPagesV3.txt'

  // Asset verification flags
  const verifyCSS = true
  const verifyJS = true
  const verifyLogo = true // Logos are typically .svg files
  const verifyImages = true // All known image formats
  const verifyPDF = true

  before(() => {
    cy.writeFile(fileName, '', { flag: 'w' })
    cy.writeFile(pageFileName, '', { flag: 'w' })
  })

  endpoints.forEach((url) => {
    it(`Validating page and assets for - ${url}`, () => {
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
                  if (
                    verifyCSS &&
                    el.tagName === 'LINK' &&
                    el.getAttribute('rel') === 'stylesheet'
                  ) {
                    return (el as HTMLLinkElement).href
                  } else if (
                    verifyJS &&
                    el.tagName === 'SCRIPT' &&
                    el.getAttribute('src')
                  ) {
                    return (el as HTMLScriptElement).src
                  } else if (el.tagName === 'IMG') {
                    const src = (el as HTMLImageElement).src

                    if (
                      (verifyLogo && src.endsWith('.svg')) ||
                      (verifyImages &&
                        (src.endsWith('.png') ||
                          src.endsWith('.jpg') ||
                          src.endsWith('.jpeg') ||
                          src.endsWith('.gif'))) ||
                      (verifyPDF && src.endsWith('.pdf'))
                    ) {
                      return src
                    }
                  }

                  return null
                })
                .filter(Boolean) // Filters out null values

              return Cypress.Promise.all(
                assets.map((asset) => {
                  if (asset) {
                    // Ensures only non-null, non-undefined values are used
                    return cy
                      .request({ url: asset, failOnStatusCode: false })
                      .then((response) => {
                        if (response.status !== 200) {
                          failedAssets.push(
                            `Failed Asset: ${asset} from ${url}, Status: ${response.status}`
                          )
                        }
                      })
                  }
                })
              )
            })
            .then(() => {
              expect(failedAssets.length, `Failed assets for ${url}`).to.eq(0)
            })
        }
      })
    })
  })

  after(() => {
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
