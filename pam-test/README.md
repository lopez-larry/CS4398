# spa_cypress


Install Cypress: 

1) cd ./pam-test

2) npm install --save-dev cypress

3) npx cypress verify

To Run:

1) run the sight locally like normal (localhost:5173)

2) navigate to pam-test folder from root folder:
  > cd ./pam-test
  - This is to help reduce excess files and decrease clutter

3) run/open cypress 
  - Interactive mode
   > npx cypress open

  - Headless mode
   - 

Stats and Tips:

- test will stop here until you resume manually
  > cy.pause();  
  - You can also sfely close the cypress windows 

> cy.get('[data-cy="email"]').debug();

Test and what they test:

- Footer 
  - test all the links in the footer

- Forms 
  - test adding/removing a breed from forms and
    searching breeds

- Login
  - Verifys all types of users can login and are 
    directed to there user landing pages such as
    admin to admin dash, breeder to breeder dash
    and makes sure proper login errors display
    proper messages

- Navigation
  - test all links in the home navbar

- Smoke
  - makes sure the site is there at least
