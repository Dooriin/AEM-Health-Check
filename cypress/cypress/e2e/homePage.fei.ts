import { generalPages } from '../pageObjects/general.pageObjects'
import { skipPages } from '../fixtures/skipPages'

describe('Homepage and Asset Verification', () => {
  const allFailedAssets = []
  const failedPages = []
  const allLogs = []
  const baseUrl = 'https://dev.moodys.com' // Base URL of your website
  // Configuration for what assets to verify
  const verifyCSS = true
  const verifyJS = true
  const verifyImages = true
  const endpoints = [baseUrl] // Add other endpoints if necessary

  function customLog(message) {
    allLogs.push(message)
    cy.log(message)
  }

  function getAssetUrl(el, baseUrl) {
    let assetUrl = ''
    const src = el.src || el.href
    if (!src) return ''

    const isCurrentSiteAsset = (url) => {
      const parsedUrl = new URL(url, baseUrl)
      return parsedUrl.hostname === new URL(baseUrl).hostname
    }

    if (
      (verifyCSS &&
        el.tagName === 'LINK' &&
        el.rel === 'stylesheet' &&
        isCurrentSiteAsset(src)) ||
      (verifyJS &&
        el.tagName === 'SCRIPT' &&
        el.src &&
        isCurrentSiteAsset(el.src)) ||
      (el.tagName === 'IMG' && verifyImages && isCurrentSiteAsset(src))
    ) {
      assetUrl = src
    }

    if (assetUrl && !assetUrl.startsWith('http')) {
      assetUrl = new URL(assetUrl, baseUrl).href
    }

    return isCurrentSiteAsset(assetUrl) ? assetUrl : ''
  }

  function checkAssets(url) {
    if (skipPages.includes(url)) {
      customLog(`Skipping verification for URL: ${url}`)
      return
    }

    cy.visit(url)
    generalPages.header().should('be.visible')
    generalPages.footer().should('be.visible')

    cy.document().then((document) => {
      const assets = Array.from(document.querySelectorAll('link, script, img'))
        .map((el) => getAssetUrl(el, url))
        .filter(Boolean) // Remove empty or undefined values

      if (assets.length === 0) {
        failedPages.push(url)
        throw new Error(`No assets found for URL: ${url}`)
      }

      assets.forEach((asset) => {
        cy.request({ url: asset, failOnStatusCode: false }).then((response) => {
          if (response.status !== 200) {
            const errorMessage = `Asset check failed: ${asset} from ${url}, Status: ${response.status}`
            allFailedAssets.push(errorMessage)
            customLog(errorMessage)
          }
        })
      })
    })
  }

  endpoints.forEach((url) => {
    it(`Validating page and assets for - ${url}`, () => {
      checkAssets(url)
    })
  })

  afterEach(() => {
    if (allFailedAssets.length > 0) {
      allFailedAssets.forEach((failure) => cy.log(failure))
      assert.fail(`Assets failed to load: ${allFailedAssets.join(', ')}`)
    }
  })
})
