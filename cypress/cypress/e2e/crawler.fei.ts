// import { endpoints } from '../../fixtures/splitEndpoints/${fixtureFileName}';
// import { whitelistPages } from '../../fixtures/whitelistPages'
// import { generalPages } from '../../pageObjects/general.pageObjects'
//
// describe('Endpoint Health Checks - Part ${chunkIndex + 1}', () => {
//   const endpoints = CrawledData.endpoints
//   const allFailedAssets = []
//   const failedPages = []
//   const fileName = 'cypress/downloads/failedAssetsV3.txt'
//   const pageFileName = 'cypress/downloads/failedPagesV3.txt'
//   const allLogs = []
//   const verifyCSS = true
//   const verifyJS = true
//   const verifyLogo = true
//   const verifyImages = true
//
//   function customLog(message) {
//     allLogs.push(message)
//     cy.log(message)
//   }
//
//   function checkAssets(url, retry = false) {
//     let assetCheckFailed = false
//
//     cy.visit(url)
//
//     if (!whitelistPages.includes(url)) {
//       // generalPages.header().should('be.visible');
//       generalPages.footer().should('be.visible')
//     }
//
//     cy.document().then((document) => {
//       const assets = Array.from(document.querySelectorAll('link, script, img'))
//         .map((el) => {
//           let assetUrl = ''
//
//           if (
//             verifyCSS &&
//             el.tagName === 'LINK' &&
//             el.getAttribute('rel') === 'stylesheet'
//           ) {
//             assetUrl = el.href
//           } else if (
//             verifyJS &&
//             el.tagName === 'SCRIPT' &&
//             el.getAttribute('src')
//           ) {
//             assetUrl = el.src
//           } else if (el.tagName === 'IMG') {
//             const src = el.src
//
//             if (
//               (verifyLogo && src.endsWith('.svg')) ||
//               (verifyImages &&
//                 (src.endsWith('.png') ||
//                   src.endsWith('.jpg') ||
//                   src.endsWith('.jpeg')))
//             ) {
//               assetUrl = src
//             }
//           }
//
//           if (assetUrl && !assetUrl.startsWith('http')) {
//             assetUrl = new URL(assetUrl, url).href
//           }
//
//           return assetUrl
//         })
//         .filter(Boolean)
//
//       if (assets.length === 0 && !retry) {
//         customLog(`No assets found, retrying for URL: ${url}`)
//         cy.wait(5000) // Wait for 5 seconds before retrying
//         return checkAssets(url, true)
//       } else if (assets.length === 0) {
//         customLog(`No assets found after retry for URL: ${url}`)
//         failedPages.push(url)
//         expect(
//           assets.length,
//           `At least one asset should be present for ${url}`
//         ).to.be.greaterThan(0)
//       } else {
//         const processAsset = (index) => {
//           if (index >= assets.length) {
//             if (assetCheckFailed) {
//               failedPages.push(url)
//               expect(assetCheckFailed, `Asset check should pass for ${url}`).to
//                 .be.false
//             }
//             return // All assets processed
//           }
//
//           const asset = assets[index]
//           customLog(`Checking asset: ${asset}`)
//
//           cy.request({ url: asset, failOnStatusCode: false })
//             .then((response) => {
//               if (response.status !== 200) {
//                 const errorMessage = `Failed Asset: ${asset} from ${url}, Status: ${response.status}`
//                 allFailedAssets.push(errorMessage)
//                 assetCheckFailed = true
//               }
//             })
//             .then(() => {
//               processAsset(index + 1) // Process next asset
//             })
//         }
//
//         processAsset(0) // Start processing assets
//       }
//     })
//   }
//
//   before(() => {
//     cy.writeFile(fileName, '', { flag: 'w' })
//     cy.writeFile(pageFileName, '', { flag: 'w' })
//   })
//
//   endpoints.forEach((url) => {
//     it(`Validating page and assets for - ${url}`, () => {
//       if (url.endsWith('.pdf')) {
//         customLog(`Skipping PDF endpoint: ${url}`)
//         return
//       }
//
//       checkAssets(url)
//     })
//   })
//
//   after(() => {
//     cy.writeFile('cypress/downloads/testLogs.txt', allLogs.join('\n'), {
//       flag: 'w+',
//     })
//
//     if (failedPages.length > 0) {
//       const pageLogContent = failedPages.join('\n')
//       cy.writeFile(pageFileName, pageLogContent, { flag: 'a+' })
//     }
//     if (allFailedAssets.length > 0) {
//       const assetLogContent = allFailedAssets.join('\n')
//       cy.writeFile(fileName, assetLogContent, { flag: 'a+' })
//     }
//   })
// })
