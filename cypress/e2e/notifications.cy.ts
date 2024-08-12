// cypress/e2e/notifications.cy.ts

describe('Notifications E2E Test', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4200/login');
  
      cy.get('input[name="username"]').type('u20418494@tuks.co.za');
      cy.get('input[name="password"]').type('Hawa1234@');
      cy.get('button[type="submit"]').contains('Sign in').click();
  
      cy.wait(5000);
  
      cy.url().then(url => {
        if (!url.includes('/dashboard')) {
          cy.log('Not redirected to dashboard. Manually navigating...');
          cy.visit('http://localhost:4200/dashboard');
        }
      });
  
      cy.url().should('include', '/dashboard', { timeout: 20000 });
      cy.contains('Inventory Levels', { timeout: 20000 }).should('be.visible');
    });
  
    it('should open and close the notification panel', () => {
      cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
      cy.get('.notification-panel').should('be.visible');
      cy.get('button[mattooltip="Close"]').click();
      cy.get('.notification-panel').should('not.be.visible');
    });
  
    it('should display notifications', () => {
      cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
      cy.get('.notification-content').should('exist');
    });
  
    it('should filter notifications', () => {
      cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
      cy.get('.notification-tabs').should('exist');
      // Assuming there's a tab for each notification type
      cy.get('.notification-tabs').contains('All').click();
      cy.get('.notification-content').should('exist');
    });
  
    it('should mark notification as read', () => {
        cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
        cy.get('.notification-content').first().within(() => {
          cy.get('button[ng-reflect-message="Mark as read"]').first().click();
        });
        // Assuming there's a visual change when marked as read
        cy.get('.notification-content').first().should('have.class', 'read');
      });
  
      it('should archive a notification', () => {
        cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
        cy.get('.notification-content').first().within(() => {
          cy.get('button[ng-reflect-message="Archive"]').first().click();
        });
        // Assuming there's a visual change when archived
        cy.get('.notification-content').first().should('have.class', 'archived');
      });
  
    it('should update unread count', () => {
    cy.get('button.toolbar-icon mat-icon').contains('notifications').find('.mat-badge-content').invoke('text').then((text) => {
      const initialCount = parseInt(text);
      cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
      cy.get('.notification-content').first().within(() => {
        cy.get('button[ng-reflect-message="Mark as read"]').first().click();
      });
      cy.get('button.toolbar-icon mat-icon').contains('notifications').find('.mat-badge-content').should('contain', initialCount - 1);
    });
  });
  
    it('should open notification details', () => {
      cy.get('button.toolbar-icon mat-icon').contains('notifications').click();
      cy.get('.notification-content').first().click();
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container button').contains('Close').click();
      cy.get('mat-dialog-container').should('not.exist');
    });
  });