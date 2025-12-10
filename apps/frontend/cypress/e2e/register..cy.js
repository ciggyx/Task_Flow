describe('register page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/auth/register');
  });

  it('should register a new user if the correct credentials are provided', () => {
    const random = Math.floor(Math.random() * 10000);
    cy.get('[data-cy="input-name"]').should('be.visible').and('not.be.disabled');
    cy.wait(100);
    // Esperar que el campo nombre esté visible Y habilitado antes de escribir
    cy.get('[data-cy="input-name"]')
      .should('be.visible')
      .should('not.be.disabled')
      .type(`testuser${random}`, { delay: 50 }); // delay ayuda con la estabilidad

    cy.get('[data-cy="input-email"]')
      .should('be.visible')
      .should('not.be.disabled')
      .type(`test${random}@gmail.com`, { delay: 50 });

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

    // Confirmar redirección al login
    cy.url().should('include', '/auth/login');
  });
  it('should navigate to log in', () => {
    cy.get('[data-cy="signin-link"]').click();
    cy.url().should('include', '/auth/login');
  });
});
