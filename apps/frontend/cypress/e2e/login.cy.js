describe('Login Page', () => {
  before(() => {
    cy.visit('http://localhost:4200/auth/register');
    cy.get('[data-cy="input-name"]').should('be.visible').and('not.be.disabled');
    cy.wait(100);
    cy.get('[data-cy="input-name"]')
      .should('be.visible')
      .should('not.be.disabled')
      .type(`test`, { delay: 50 }); // delay ayuda con la estabilidad

    cy.get('[data-cy="input-email"]')
      .should('be.visible')
      .should('not.be.disabled')
      .type(`test@gmail.com`, { delay: 50 });

    cy.get('[data-cy="input-password"]')
      .should('be.visible')
      .should('not.be.disabled')
      .type('123123123', { delay: 50 });

    cy.get('[data-cy="input-confirmed-password"]')
      .should('be.visible')
      .should('not.be.disabled')
      .type('123123123', { delay: 50 });

    // Esperar que el botón esté habilitado (importante si depende de validación)
    cy.get('button[type="submit"]').should('be.visible').should('not.be.disabled').click();
  });
  beforeEach(() => {
    cy.visit('http://localhost:4200/auth/login');
    cy.get('[data-cy="input-identifier"]').should('be.visible');
    cy.get('[data-cy="input-password"]').should('be.visible');
  });
  it('should login with valid username credentials', () => {
    cy.get('[data-cy="input-identifier"]').as('identifier');
    cy.get('@identifier').should('be.visible').and('be.enabled');
    cy.get('@identifier').type('test');

    cy.get('[data-cy="input-password"]').as('password');
    cy.get('@password').should('be.visible').and('be.enabled');
    cy.get('@password').type('12341234');

    cy.get('button[type="submit"]').click();
    cy.contains('Login successful! Redirecting...');
    cy.url().should('include', '/home');
  });
  it('should login with valid email credentials', () => {
    cy.get('[data-cy="input-identifier"]').as('identifier');
    cy.get('@identifier').should('be.visible').and('be.enabled');
    cy.get('@identifier').type('test@gmail.com');

    cy.get('[data-cy="input-password"]').as('password');
    cy.get('@password').should('be.visible').and('be.enabled');
    cy.get('@password').type('12341234');

    cy.get('button[type="submit"]').click();
    cy.contains('Login successful! Redirecting...');
    cy.url().should('include', '/home');
  });
  it('should navigate to forgot password', () => {
    cy.get('[data-cy="forgot-link"]').click();
    cy.url().should('include', '/auth/forgot-password');
  });
  it('should throw an error if the worng credentials are provided', () => {
    cy.get('[data-cy="input-identifier"]').as('identifier');
    cy.get('@identifier').should('be.visible').and('be.enabled');
    cy.get('@identifier').type('Notatest@gmail.com');

    cy.get('[data-cy="input-password"]').as('password');
    cy.get('@password').should('be.visible').and('be.enabled');
    cy.get('@password').type('12341234');

    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials');
  });

  it('sholud navigate to register', () => {
    cy.get('[data-cy="signup-link"]').click();
  });
});
