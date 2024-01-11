import { defineConfig } from 'cypress'
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'

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

  // Simplified configuration for two environments
  let hostString

  switch (config.env.fixture) {
    case 'development':
      hostString = 'https://dev.moodys.com'
      break
    case 'stage':
      hostString = 'https://stg.moodys.com'
      break
    default:
      throw new Error(
        'Invalid environment. Please set fixture to either "dev" or "stg".'
      )
  }

  // Set base URL
  config.baseUrl = new URL(hostString).href

  return config
}

export default defineConfig({
  defaultCommandTimeout: 30000,
  numTestsKeptInMemory: 10,
  pageLoadTimeout: 60000,
  requestTimeout: 30000,
  responseTimeout: 30000,
  retries: 2,
  scrollBehavior: 'center',
  video: false,
  projectId: '33f6hf',
  e2e: {
    specPattern:
      'cypress/**/*.{feature,api.ts,ftp.ts,util.ts,bei.ts,fei.ts,e2e.ts,bvt.ts,stub.ts}',
    setupNodeEvents,
  },
})
