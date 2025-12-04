describe('Footer Navigation', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('navigates Quick Links (Home, About)', () => {
        cy.get('footer').within(() => {
            cy.contains('a', 'Home').click();
        });
        cy.url().should('include', '/');

        cy.get('footer').within(() => {
            cy.contains('a', 'About').click();
        });
        cy.url().should('include', '/about');
        cy.go('back');
    });

    it('checks Follow Us links exist', () => {
        cy.get('footer').within(() => {
            cy.contains('a', 'Twitter').should('exist');
            cy.contains('a', 'LinkedIn').should('exist');
            cy.contains('a', 'GitHub').should('exist');
        });
    });

    it('navigates Legal links (Privacy Policy, Terms of Service)', () => {
        cy.get('footer').within(() => {
            cy.contains('a', 'Privacy Policy').click();
        });
        cy.url().should('include', '/privacy-policy');
        cy.go('back');

        cy.get('footer').within(() => {
            cy.contains('a', 'Terms of Service').click();
        });
        cy.url().should('include', '/terms-of-service');
        cy.go('back');
    });

    it('accepts consent banner', () => {
        cy.get('.consent-banner').within(() => {
            cy.contains('button', 'Accept').click();
        });
        // After clicking Accept, banner should disappear
        cy.contains('h1, h2, h3', 'Login').should('be.visible');
        cy.get('.Toastify__toast--info')
            .should('be.visible')
            .and('contain.text', 'Please log in before accepting consent.');

    });
});
