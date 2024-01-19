export const loginPage = {
  emailInput: () => cy.get('[data-testid="emailInput"]'),
  emailContinueButton: () => cy.get('[data-testid="emailContinueButton"]'),
  passwordInput: () => cy.get('[data-testid="password"]'),
  continueLoginButton: () => cy.get('[data-testid="loadingButton"]'),
  loginModal: () => cy.get('[aria-labelledby="modal-title"]'),
  modalTitle: () => cy.get('#modal-title'),
}
