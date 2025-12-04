describe('Admin Manage Breeds Flow', () => {
    beforeEach(() => {
        cy.visit('/login');

        // login as admin
        cy.intercept('POST', '**/api/user/login').as('loginRequest');
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('Password123!');
        cy.contains('button', 'Login').click();
        cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

        // confirm heading is visible
        cy.contains('h3', 'Manage Breeds').should('be.visible');

        // if breeds form/table is collapsed, click chevron to expand
        cy.contains('h3', 'Manage Breeds').click();
    });

    it('can search, delete, and re-add a dog breed', () => {
        cy.intercept('GET', '**/api/breeds*').as('getBreeds');
        cy.intercept('POST', '**/api/breeds').as('addBreed');
        cy.intercept('DELETE', '**/api/breeds/*').as('deleteBreed');

        cy.get('input[placeholder="Search breeds..."]').type('Beagle');

        // search for Beagle
        cy.contains('td', 'Beagle').should('be.visible');

        // delete Beagle
        cy.contains('tr', 'Beagle').within(() => {
            cy.contains('button', 'Delete').click();
        });
        cy.contains('td', 'Beagle').should('not.exist');

        // re-add Beagle
// re-add Beagle
        cy.get('input[placeholder="New breed name"]').clear().type('Beagle');
        cy.contains('button', 'Add Breed').click();
        cy.contains('td', 'Beagle').should('be.visible');

    });
});
