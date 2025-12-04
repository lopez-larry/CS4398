describe('Login Flow', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('logs in as breeder, sees breeder menu, and after logout sees public nav', () => {
        cy.intercept('POST', '**/api/user/login').as('loginRequest');

        // login
        cy.get('input[placeholder="Email"]').type('breeder@example.com');
        cy.get('input[placeholder="Password"]').type('Password123!');
        cy.contains('button', 'Login').click();

        cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

        // open breeder dropdown
        cy.get('#breederDropdown').click();

        // check breeder menu
        cy.get('.dropdown-menu').within(() => {
            cy.contains('a', 'My Dogs').should('exist');
            cy.contains('a', 'New Dog').should('exist');
            cy.contains('a', 'Profile').should('exist');
        });

        // logout
        cy.contains('button', 'Logout').click();

        // ✅ check public nav after logout
        cy.get('#navbarNav').within(() => {
            cy.contains('a', 'Home').should('have.attr', 'href', '/');
            cy.contains('a', 'About').should('have.attr', 'href', '/about');
            cy.contains('a', 'Blog').should('have.attr', 'href', '/blog');
            cy.contains('a', 'Login').should('have.attr', 'href', '/login');
            cy.contains('a', 'Register').should('have.attr', 'href', '/register');
        });
    });

    it('logs in successfully with customer credentials and sees customer nav', () => {
        cy.intercept('POST', '**/api/user/login').as('loginRequest');

        // login
        cy.get('input[placeholder="Email"]').type('customer@example.com');
        cy.get('input[placeholder="Password"]').type('Password123!');
        cy.contains('button', 'Login').click();

        // wait for API
        cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

        // ✅ assert customer-specific nav
        cy.get('#customerDropdown').should('be.visible').click();

        cy.get('.dropdown-menu').within(() => {
            cy.contains('a', 'Saved Dogs').should('have.attr', 'href', '/customer/saved-dogs');
            cy.contains('a', 'Profile').should('have.attr', 'href', '/profile');
        });

        // assert top-level nav exists
        cy.get('#navbarNav').within(() => {
            cy.contains('a', 'Blog').should('have.attr', 'href', '/blog');
            cy.contains('a', 'Puppies').should('have.attr', 'href', '/dogs');
        });

        // logout flow
        cy.contains('button', 'Logout').click();

        // assert back to public nav
        cy.get('#navbarNav').within(() => {
            cy.contains('a', 'Home').should('exist');
            cy.contains('a', 'About').should('exist');
            cy.contains('a', 'Blog').should('exist');
            cy.contains('a', 'Login').should('exist');
            cy.contains('a', 'Register').should('exist');
        });

        // and ensure customer dropdown is gone
        cy.get('#customerDropdown').should('not.exist');
    });

    it('logs in successfully with admin credentials and sees admin nav', () => {
        cy.intercept('POST', '**/api/user/login').as('loginRequest');

        // login
        cy.get('input[placeholder="Email"]').type('admin@example.com');
        cy.get('input[placeholder="Password"]').type('Password123!');
        cy.contains('button', 'Login').click();

        // wait for API
        cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

        // ✅ assert admin dropdown exists and open it
        cy.get('#adminDropdown').should('be.visible').click();

        // assert all admin menu items
        cy.get('.dropdown-menu').within(() => {
            cy.contains('a', 'Manage Users').should('have.attr', 'href', '/admin/users');
            cy.contains('a', 'Metrics Dashboard').should('have.attr', 'href', '/admin/dashboard');
            cy.contains('a', 'New Post').should('have.attr', 'href', '/admin/posts/new');
            cy.contains('a', 'Post List').should('have.attr', 'href', '/admin/posts');
            cy.contains('a', 'Profile').should('have.attr', 'href', '/profile');
        });

        // logout
        cy.contains('button', 'Logout').click();

        // ✅ assert public nav again
        cy.get('#navbarNav').within(() => {
            cy.contains('a', 'Home').should('exist');
            cy.contains('a', 'About').should('exist');
            cy.contains('a', 'Blog').should('exist');
            cy.contains('a', 'Login').should('exist');
            cy.contains('a', 'Register').should('exist');
        });

        // ensure admin dropdown is gone
        cy.get('#adminDropdown').should('not.exist');
    });


    it('shows error on invalid credentials', () => {
        cy.get('input[placeholder="Email"]').type('wrong@example.com');
        cy.get('input[placeholder="Password"]').type('wrongpass');
        cy.contains('button', 'Login').click();


        cy.get('p.text-danger').should('contain.text', 'Invalid email or password');

    });
    it('navigates to forgot password page from login', () => {
        // Click the "Forgot Password?" link
        cy.contains('a', 'Forgot Password?').should('have.attr', 'href', '/forgot-password').click();

        // Verify that the URL includes /forgot-password
        cy.url().should('include', '/forgot-password');

        // Optionally, verify some content on the forgot password page
        cy.contains('h1, h2, h3', 'Forgot Password').should('be.visible'); 
    });
    it('navigates to the register page from login', () => {
        // Click the "Register" link on the login page
        cy.contains('a', 'Register').should('have.attr', 'href', '/register').click();
      
        // Verify that the URL includes /register
        cy.url().should('include', '/register');
      
        // Optionally, verify some content on the register page
        cy.contains('h1, h2, h3', 'Register').should('be.visible'); // adjust text if needed
      });
});
