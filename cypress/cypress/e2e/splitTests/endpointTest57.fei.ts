
import { endpoints } from '../../fixtures/splitEndpoints/crawledEndpointsPart57.json';
import { whitelistPages } from '../../fixtures/whitelistPages';
import { generalPages } from '../../pageObjects/general.pageObjects';
import { skipPages } from '../../fixtures/skipPages';

describe('Endpoint Health Checks - Part 57', () => {
  const allFailedAssets = [];
  const failedPages = [];
  const fileName = 'cypress/downloads/failedAssetsV3.txt';
  const pageFileName = 'cypress/downloads/failedPagesV3.txt';
  const allLogs = [];
  const verifyCSS = true;
  const verifyJS = true;
  const verifyLogo = true;
  const verifyImages = true;


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

  function checkAssets(url, retry = false) {
    let assetCheckFailed = false;
    let currentFailedAssets = []; // Array to store failed assets for the current URL

    if (skipPages.includes(url)) {
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
        cy.wait(2000); // Wait for 5 seconds before retrying
        return checkAssets(url, true);
      } else if (assets.length === 0) {
        failedPages.push(url);
        expect(assets.length, `At least one asset should be present for ${url}`).to.be.greaterThan(0);
      } else {
        const processAsset = index => {
          if (index >= assets.length) {
            if (assetCheckFailed) {
              failedPages.push(url);
              allFailedAssets.push(...currentFailedAssets);
              expect(assetCheckFailed, `Failed assets for ${url}: ${currentFailedAssets.join(', ')}`).to.be.false;
            }
            return; // All assets processed
          }

          const asset = assets[index];
          if (!isValidAssetUrl(asset)) {
            processAsset(index + 1);
            return;
          }

          cy.request({ url: asset, failOnStatusCode: false }).then(response => {
            if (response.status !== 200) {
              const errorMessage = `Failed Asset: ${asset} from ${url}, Status: ${response.status}`;
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

  endpoints.forEach(url => {
    it(`Validating page & assets - ${url}`, () => {
      if (url.endsWith('.pdf')) {
        return;
      }

      checkAssets(url);
    });
  });

});
