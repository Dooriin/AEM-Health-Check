import { loginPage } from '../pageObjects/login.pageObjects'
import { generalPages } from '../pageObjects/general.pageObjects'

describe('Secure Page and SSO Login Validation', () => {
  const environments = [
    {
      envName: 'DEV',
      urlKey: 'DEV_URL',
      pageUrl: '/web/en/us/topic-page.html',
      passwordKey: 'USER1_DEV_PASSWORD',
    },
    {
      envName: 'STG',
      urlKey: 'STG_URL',
      pageUrl: '/web/en/us/topic-page.html',
      passwordKey: 'USER1_STG_PASSWORD',
    },
    {
      envName: 'PRD',
      urlKey: 'PROD_URL',
      pageUrl: '/web/en/us/secure-topic.html',
      passwordKey: 'USER1_PROD_PASSWORD',
    },
  ]

  const username = 'esgtest_ESGView@moodys-test.com'

  // Function to generate a random number within a specific range
  const generateRandomNumber = (min: any, max: any) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  environments.forEach((env) => {
    context(`${env.envName} Environment - SSO Verification`, () => {
      it(`Should login and verify content in ${env.envName}`, () => {
        // Generate a random number for the query parameter
        const randomQueryParam = generateRandomNumber(1000, 9999)

        // Append the random query parameter to the URL
        cy.visit(
          `${Cypress.env(env.urlKey)}${env.pageUrl}?p=${randomQueryParam}`
        )

        loginPage.modalTitle().should('contain.text', 'Sign in or register')
        loginPage.emailInput().should('be.visible').type(username)
        loginPage.emailContinueButton().should('be.enabled').click()

        const password = Cypress.env(env.passwordKey)
        loginPage.passwordInput().should('be.visible').type(password)

        loginPage.continueLoginButton().click()
        loginPage.loginModal().should('not.exist')

        generalPages.header().should('be.visible')
        // generalPages.footer().should('be.visible')
      })
    })
  })
})
