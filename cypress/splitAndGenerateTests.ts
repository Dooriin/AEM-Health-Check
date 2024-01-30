import fs from 'fs'
import path from 'path'

// Define CrawledData type
interface CrawledData {
  endpoints: string[]
}

const crawledData = require('./cypress/fixtures/crawledEndpoints')
const endpoints = crawledData.CrawledData.endpoints
const chunkSize = 30
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

  const testFileContent = `
  import { endpoints } from '../../fixtures/splitEndpoints/${fixtureFileName}';
import { whitelistPages } from '../../fixtures/whitelistPages'
import { generalPages } from '../../pageObjects/general.pageObjects'


  describe('Endpoint Health Checks - Part ${chunkIndex + 1}', () => {
    const allFailedAssets = [];
    const failedPages = [];
    const fileName = 'downloads/failedAssetsV3.txt';
    const pageFileName = 'downloads/failedPagesV3.txt';
    const allLogs = [];
    const verifyCSS = true;
    const verifyJS = true;
    const verifyLogo = true;
    const verifyImages = true;

    function customLog(message) {
      allLogs.push(message);
      cy.log(message);
    }

    function checkAssets(url, retry = false) {
    cy.visit(url)
    if (!whitelistPages.includes(url)) {
      generalPages.footer().should('be.visible')
    }
      cy.document().then((document) => {
        const assets = Array.from(document.querySelectorAll('link, script, img'))
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
                  src.endsWith('.jpeg') ))
            ) {
              assetUrl = src
            }
          }
          if (assetUrl && !assetUrl.startsWith('http')) {
            assetUrl = new URL(assetUrl, url).href
          }

          return assetUrl
        })
          .filter(Boolean);

        if (assets.length === 0 && !retry) {
          customLog(\`No assets found, retrying for URL: \${url}\`);
          cy.wait(5000);
          return checkAssets(url, true);
        } else if (assets.length === 0) {
          customLog(\`No assets found after retry for URL: \${url}\`);
          expect(assets.length, \`At least one asset should be present for \${url}\`).to.be.greaterThan(0);
        } else {
          const processAsset = (index) => {
            if (index >= assets.length) {
              return;
            }

            const asset = assets[index];
            customLog(\`Checking asset: \${asset}\`);

            cy.request({ url: asset, failOnStatusCode: false })
              .then((response) => {
                if (response.status !== 200) {
                  const errorMessage = \`Failed Asset: \${asset} from \${url}, Status: \${response.status}\`;
                  allFailedAssets.push(errorMessage);
                }
              })
              .then(() => {
                processAsset(index + 1);
              });
          };

          processAsset(0);
        }
      });
    }

    before(() => {
      cy.writeFile(fileName, '');
      cy.writeFile(pageFileName, '');
    });

    endpoints.forEach((url) => {
      it(\`Validating page and assets for - \${url}\`, () => {
        if (url.endsWith('.pdf')) {
          customLog(\`Skipping PDF endpoint: \${url}\`);
          return;
        }
        checkAssets(url);
      });
    });

    after(() => {
      cy.writeFile('downloads/testLogs.txt', allLogs.join('\\n'));
      if (failedPages.length > 0) {
        cy.writeFile(pageFileName, failedPages.join('\\n'));
      }
      if (allFailedAssets.length > 0) {
        cy.writeFile(fileName, allFailedAssets.join('\\n'));
      }
      cy.clearCookies();
      cy.clearLocalStorage();
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
