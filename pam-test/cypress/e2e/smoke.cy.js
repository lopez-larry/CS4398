describe('Smoke Test', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains(/welcome/i).should('be.visible'); // adjust based on your app
  });
});
