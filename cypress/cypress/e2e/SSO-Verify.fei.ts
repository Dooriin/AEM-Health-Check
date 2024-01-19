import { loginPage } from '../pageObjects/login.pageObjects'
import { generalPages } from '../pageObjects/general.pageObjects'

describe('Secure Page and SSO Login Validation for Multiple Users', () => {
  const environments = [
    {
      envName: 'DEV',
      urlKey: 'DEV_URL',
      pageUrl: '/web/en/us/topic-sso-1.html',
    },
    {
      envName: 'STG',
      urlKey: 'STG_URL',
      pageUrl: '/web/en/us/topic-sso-1.html',
    },
    {
      envName: 'PRD',
      urlKey: 'PROD_URL',
      pageUrl: '/web/en/us/secure-topic.html',
    },
  ]

  const users = [
    {
      username: 'CV2Internal31@moodys-test.com',
      passwordKey: 'USER2_PASSWORD',
    },
    {
      username: 'esgtest_ESGView@moodys-test.com',
      passwordKeyPrefix: 'USER1_',
    },
  ]

  users.forEach((user) => {
    environments.forEach((env) => {
      context(
        `${env.envName} Environment - SSO Verification for ${user.username}`,
        () => {
          it(`Should login and verify content for ${user.username} in ${env.envName}`, () => {
            cy.visit(Cypress.env(env.urlKey) + env.pageUrl)

            loginPage.modalTitle().should('contain.text', 'Sign in or register')
            loginPage.emailInput().should('be.visible').type(user.username)
            loginPage.emailContinueButton().should('be.enabled').click()

            const passwordKey = user.passwordKey
              ? user.passwordKey
              : `${user.passwordKeyPrefix}${env.envName}_PASSWORD`
            const password = Cypress.env(passwordKey)
            loginPage.passwordInput().should('be.visible').type(password)

            loginPage.continueLoginButton().click()
            loginPage.loginModal().should('not.exist')

            generalPages.header().should('be.visible')
            generalPages.footer().should('be.visible')

          })
        }
      )
    })
  })
})
