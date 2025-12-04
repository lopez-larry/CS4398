describe('Navbar Navigation Flow', () => {
  beforeEach(() => {
    cy.visit('/'); // always start from home
  });

  it('navigates through all navbar links and validates content', () => {
    // Home
    cy.contains('a.nav-link', 'Home').click();
    cy.url().should('include', '/'); // still home

    // About
    cy.contains('a.nav-link', 'About').click();
    cy.url().should('include', '/about');
    cy.contains('h1, h2, h3', 'About Us').should('be.visible');
    cy.go('back');

    // Blog
    cy.contains('a.nav-link', 'Blog').click();
    cy.url().should('include', '/login');
    cy.contains('h1, h2, h3', 'Login').should('be.visible');
    cy.go('back');

    // Login
    cy.contains('a.nav-link', 'Login').click();
    cy.url().should('include', '/login');
    cy.contains('h1, h2, h3', 'Login').should('be.visible');
    cy.go('back');

    // Register
    cy.contains('a.nav-link', 'Register').click();
    cy.url().should('include', '/register');
    cy.contains('h1, h2, h3', 'Register').should('be.visible');
    cy.go('back');

    
  });
});
