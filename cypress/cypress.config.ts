import { defineConfig } from 'cypress'
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'

const cypressSplit = require('cypress-split')
const webpackPreprocessor = require('@cypress/webpack-preprocessor')

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config)

  on(
    'file:preprocessor',
    webpackPreprocessor({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.js'],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                  },
                },
              ],
            },
            {
              test: /\.feature$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                  options: config,
                },
              ],
            },
          ],
        },
      },
    })
  )

  let hostString

  switch (config.env.fixture) {
    case 'development':
      hostString = 'https://dev.moodys.com'
      break
    case 'stage':
      hostString = 'https://stg.moodys.com'
      break
    case 'production':
      hostString = 'https://www.moodys.com'
      break
    default:
      throw new Error(
        'Invalid environment. Please set fixture to "development", "stage", or "production".'
      )
  }

  config.baseUrl = new URL(hostString).href

  cypressSplit(on, config)

  return config
}

export default defineConfig({
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 60000,
  requestTimeout: 30000,
  responseTimeout: 30000,
  viewportHeight: 1500,
  projectId: '33f6hf',
  viewportWidth: 1980,
  retries: 2,
  scrollBehavior: 'center',
  video: false,
  e2e: {
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,
    screenshotOnRunFailure: false,
    specPattern:
      'cypress/**/*.{feature,api.ts,ftp.ts,util.ts,bei.ts,fei.ts,e2e.ts,bvt.ts,stub.ts}',
    setupNodeEvents,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/mocha',
      overwrite: false,
      html: false,
      json: true,
    },
  },
})
