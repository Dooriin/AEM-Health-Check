import fs from 'fs'
import path from 'path'

// Define CrawledData type
interface CrawledData {
  endpoints: string[]
}

const crawledData = require('./cypress/fixtures/crawledEndpoints')
const endpoints = crawledData.CrawledData.endpoints
const chunkSize = 10
const fixtureDir = path.join(__dirname, 'cypress/fixtures/splitEndpoints')
const testDir = path.join(__dirname, 'cypress/e2e/splitTests')

if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir)
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir)

for (let i = 0; i < endpoints.length; i += chunkSize) {
  const chunk = endpoints.slice(i, i + chunkSize)
  const chunkIndex = Math.floor(i / chunkSize)
  const fixtureFileName = `crawledEndpointsPart${chunkIndex + 1}.json`
  const testFileName = `endpointTest${chunkIndex + 1}.fei.ts`

  fs.writeFileSync(
    path.join(fixtureDir, fixtureFileName),
    JSON.stringify({ endpoints: chunk }, null, 2)
  )

  // const testFileContent = `
  // import { endpoints } from '../../fixtures/splitEndpoints/${fixtureFileName}';
  // import { whitelistPages } from '../../fixtures/whitelistPages'
  // import { generalPages } from '../../pageObjects/general.pageObjects'
  // import { skipPages } from '../../fixtures/skipPages';
  //
  //
  // describe('Endpoint Health Checks - Part ${chunkIndex + 1}', () => {
  //   const allFailedAssets = [];
  //   const failedPages = [];
  //   const fileName = 'cypress/downloads/failedAssetsV3.txt';
  //   const pageFileName = 'cypress/downloads/failedPagesV3.txt';
  //   const allLogs = [];
  //   const verifyCSS = true;
  //   const verifyJS = true;
  //   const verifyLogo = true;
  //   const verifyImages = true;
  //
  //   function customLog(message) {
  //     allLogs.push(message);
  //     cy.log(message);
  //   }
  //
  // function appendRandomQueryParam(url) {
  //   const randomParamValue = Math.floor(Math.random() * 100000); // Generates a random number between 0 and 99999
  //   const urlWithParam = new URL(url);
  //   urlWithParam.searchParams.append('p', randomParamValue);
  //   return urlWithParam.toString();
  // }
  //   function checkAssets(url, retry = false) {
  //     let assetCheckFailed = false;
  //     let currentFailedAssets = []; // Array to store failed assets for the current URL
  //
  //     cy.visit(url);
  //
  //     if (!whitelistPages.includes(url)) {
  //       generalPages.footer().should('be.visible');
  //     }
  //
  //     cy.document().then(document => {
  //       const assets = Array.from(document.querySelectorAll('link, script, img'))
  //         .map(el => {
  //           let assetUrl = '';
  //
  //           if (verifyCSS && el.tagName === 'LINK' && el.getAttribute('rel') === 'stylesheet') {
  //             assetUrl = el.href;
  //           } else if (verifyJS && el.tagName === 'SCRIPT' && el.getAttribute('src')) {
  //             assetUrl = el.src;
  //           } else if (el.tagName === 'IMG') {
  //             const src = el.src;
  //
  //             if ((verifyLogo && src.endsWith('.svg')) || (verifyImages && (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg')))) {
  //               assetUrl = src;
  //             }
  //           }
  //
  //           if (assetUrl && !assetUrl.startsWith('http')) {
  //             assetUrl = new URL(assetUrl, url).href;
  //           }
  //
  //           return assetUrl;
  //         })
  //         .filter(Boolean);
  //
  //       if (assets.length === 0 && !retry) {
  //         customLog(\`No assets found, retrying for URL: \${url}\`);
  //         cy.wait(5000); // Wait for 5 seconds before retrying
  //         return checkAssets(url, true);
  //       } else if (assets.length === 0) {
  //         customLog(\`No assets found after retry for URL: \${url}\`);
  //         failedPages.push(url);
  //         expect(assets.length, \`At least one asset should be present for \${url}\`).to.be.greaterThan(0);
  //       } else {
  //         const processAsset = index => {
  //           if (index >= assets.length) {
  //             if (assetCheckFailed) {
  //               failedPages.push(url);
  //               allFailedAssets.push(...currentFailedAssets);
  //               expect(assetCheckFailed, \`Failed assets for \${url}: \${currentFailedAssets.join(', ')}\`).to.be.false;
  //             }
  //             return; // All assets processed
  //           }
  //
  //           const asset = assets[index];
  //           customLog(\`Checking asset: \${asset}\`);
  //
  //           cy.request({ url: asset, failOnStatusCode: false }).then(response => {
  //             if (response.status !== 200) {
  //               const errorMessage = \`Failed Asset: \${asset} from \${url}, Status: \${response.status}\`;
  //               currentFailedAssets.push(errorMessage);
  //               assetCheckFailed = true;
  //             }
  //           }).then(() => {
  //             processAsset(index + 1); // Process next asset
  //           });
  //         };
  //
  //         processAsset(0); // Start processing assets
  //       }
  //     });
  //   }
  //
  //   before(() => {
  //     cy.writeFile(fileName, '', { flag: 'w' });
  //     cy.writeFile(pageFileName, '', { flag: 'w' });
  //   });
  //
  //   endpoints.forEach(url => {
  //     it(\`Validating page and assets for - \${url}\`, () => {
  //       if (url.endsWith('.pdf')) {
  //         customLog(\`Skipping PDF endpoint: \${url}\`);
  //         return;
  //       }
  //       if (skipPages.includes(url)) {
  //       console.log(\`Skipping entire verification for URL: \${url}\`)
  //       return // Skip the rest of the function
  //     }
  //
  //       const urlWithRandomParam = appendRandomQueryParam(url); // Append random query param to the URL
  //     checkAssets(urlWithRandomParam);
  //     });
  //   });
  // });
  // `
  const testFileContent = `
import { endpoints } from '../../fixtures/splitEndpoints/${fixtureFileName}';
import { whitelistPages } from '../../fixtures/whitelistPages';
import { generalPages } from '../../pageObjects/general.pageObjects';
import { skipPages } from '../../fixtures/skipPages';

describe('Endpoint Health Checks - Part ${chunkIndex + 1}', () => {
  const allFailedAssets = [];
  const failedPages = [];
  const fileName = 'cypress/downloads/failedAssetsV3.txt';
  const pageFileName = 'cypress/downloads/failedPagesV3.txt';
  const allLogs = [];
  const verifyCSS = true;
  const verifyJS = true;
  const verifyLogo = true;
  const verifyImages = true;

  function customLog(message) {
    allLogs.push(message);
    cy.log(message);
  }

  function sanitizeUrl(assetUrl) {
    try {
      const decodedUrl = decodeURIComponent(assetUrl);
      if (/<|>/.test(decodedUrl)) {
        return null;
      }
      return decodedUrl;
    } catch (e) {
      return null; // URL is malformed and cannot be decoded
    }
  }

  function isValidAssetUrl(assetUrl) {
    if (!assetUrl) return false;
    try {
      const url = new URL(assetUrl);
      return url.hostname.endsWith('moodys.com');
    } catch (e) {
      return false; // URL is invalid or malformed
    }
  }

  function appendRandomQueryParam(url) {
    const randomParamValue = Math.floor(Math.random() * 100000); // Generates a random number between 0 and 99999
    const urlWithParam = new URL(url);
    urlWithParam.searchParams.append('p', randomParamValue);
    return urlWithParam.toString();
  }
  
  function checkAssets(url, retry = false) {
    let assetCheckFailed = false;
    let currentFailedAssets = []; // Array to store failed assets for the current URL

    if (skipPages.includes(url)) {
      customLog(\`Skipping entire verification for URL: \${url}\`);
      return; // Skip the rest of the function
    }

    cy.visit(url);

    if (!whitelistPages.includes(url)) {
      generalPages.footer().should('be.visible');
    }

    cy.document().then(document => {
      const assets = Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src], img'))
        .map(el => {
          let assetUrl = el.tagName === 'LINK' ? el.href : el.src;
          return sanitizeUrl(assetUrl);
        })
        .filter(Boolean) // Filter out null values returned by sanitizeUrl
        .filter(assetUrl => assetUrl.startsWith('http'))
        .filter(isValidAssetUrl);

      if (assets.length === 0 && !retry) {
        customLog(\`No assets found, retrying for URL: \${url}\`);
        cy.wait(5000); // Wait for 5 seconds before retrying
        return checkAssets(url, true);
      } else if (assets.length === 0) {
        customLog(\`No assets found after retry for URL: \${url}\`);
        failedPages.push(url);
        expect(assets.length, \`At least one asset should be present for \${url}\`).to.be.greaterThan(0);
      } else {
        const processAsset = index => {
          if (index >= assets.length) {
            if (assetCheckFailed) {
              failedPages.push(url);
              allFailedAssets.push(...currentFailedAssets);
              expect(assetCheckFailed, \`Failed assets for \${url}: \${currentFailedAssets.join(', ')}\`).to.be.false;
            }
            return; // All assets processed
          }

          const asset = assets[index];
          if (!isValidAssetUrl(asset)) {
            customLog(\`Invalid or non-Moody's asset URL skipped: \${asset}\`);
            processAsset(index + 1);
            return;
          }

          customLog(\`Checking asset: \${asset}\`);

          cy.request({ url: asset, failOnStatusCode: false }).then(response => {
            if (response.status !== 200) {
              const errorMessage = \`Failed Asset: \${asset} from \${url}, Status: \${response.status}\`;
              currentFailedAssets.push(errorMessage);
              assetCheckFailed = true;
            }
          }).then(() => {
            processAsset(index + 1); // Process next asset
          });
        };

        processAsset(0); // Start processing assets
      }
    });
  }

  before(() => {
    cy.writeFile(fileName, '', { flag: 'w' });
    cy.writeFile(pageFileName, '', { flag: 'w' });
  });

  endpoints.forEach(url => {
    it(\`Validating page and assets for - \${url}\`, () => {
      if (url.endsWith('.pdf')) {
        customLog(\`Skipping PDF endpoint: \${url}\`);
        return;
      }
      const urlWithRandomParam = appendRandomQueryParam(url); // Append random query param to the URL
      checkAssets(urlWithRandomParam);
     
    });
  });

  after(() => {
    cy.writeFile('cypress/downloads/testLogs.txt', allLogs.join('\\n'), { flag: 'w+' });

    if (failedPages.length > 0) {
      const pageLogContent = failedPages.join('\\n');
      cy.writeFile(pageFileName, pageLogContent, { flag: 'a+' });
    }
    if (allFailedAssets.length > 0) {
      const assetLogContent = allFailedAssets.join('\\n');
      cy.writeFile(fileName, assetLogContent, { flag: 'a+' });
    }
  });
});
`


  fs.writeFileSync(path.join(testDir, testFileName), testFileContent)
}
const generatedFiles = fs
  .readdirSync(fixtureDir)
  .filter((file: string) => file.startsWith('crawledEndpointsPart'))
let totalEndpoints = 0
generatedFiles.forEach((file: string) => {
  const data: CrawledData = JSON.parse(
    fs.readFileSync(path.join(fixtureDir, file)).toString()
  )
  totalEndpoints += data.endpoints.length
})
console.log(`Total Endpoints: ${totalEndpoints}`)
