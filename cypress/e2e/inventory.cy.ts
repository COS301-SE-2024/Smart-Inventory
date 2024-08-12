// cypress/e2e/inventory.cy.ts

describe('Inventory Page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4200/login');
      cy.get('input[name="username"]').type('u20418494@tuks.co.za');
      cy.get('input[name="password"]').type('Hawa1234@');
      cy.get('button[type="submit"]').contains('Sign in').click();
  
      // Wait for any redirects to complete
      cy.wait(5000);
  
      // Log the current URL
      cy.url().then(url => {
        cy.log(`Current URL after login: ${url}`);
      });
  
      // Check if we're on the dashboard, if not, try to navigate there
      cy.url().then(url => {
        if (!url.includes('/dashboard')) {
          cy.log('Not on dashboard, attempting to navigate...');
          cy.visit('http://localhost:4200/dashboard');
        }
      });
  
      // Wait again and log the URL
      cy.wait(2000);
      cy.url().then(url => {
        cy.log(`URL after attempted navigation: ${url}`);
      });
  
      // Try to find the Inventory link in the sidenav
      cy.get('body').then($body => {
        if ($body.find('.sidenav').length) {
          cy.get('.sidenav').contains('Inventory').click();
        } else {
          cy.log('Sidenav not found, attempting direct navigation to inventory');
          cy.visit('http://localhost:4200/inventory');
        }
      });
  
      // Final check and log
      cy.url().should('include', '/inventory').then(url => {
        cy.log(`Final URL: ${url}`);
      });
    });
  
    it('should display the inventory grid', () => {
      cy.get('app-grid', { timeout: 10000 }).should('be.visible');
      cy.get('.ag-header-cell').should('have.length.at.least', 1);
      cy.get('.ag-row').should('have.length.at.least', 1);
    });
  
    it('should open the Add New Item modal', () => {
      // Click on the Quick Actions dropdown
      cy.contains('span', 'Quick Actions').click();
  
      // Click on the Add Item option
      cy.contains('span.mat-mdc-menu-item-text', '+ Add Item').click();
  
      // Check if the modal is visible
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container').contains('h2', 'Add Inventory Item').should('be.visible');
    });
  
    it('should add a new inventory item', () => {
      // Open the Add New Item modal
      cy.contains('span', 'Quick Actions').click();
      cy.contains('span.mat-mdc-menu-item-text', '+ Add Item').click();
      
      // Fill out the form
      cy.get('input[formControlName="upc"]').type('123456789');
      cy.get('input[formControlName="sku"]').type('TEST-SKU-001');
      cy.get('input[formControlName="description"]').type('Test Item');
      cy.get('mat-select[formControlName="category"]').click().get('mat-option').contains('Food: Non-Perishable').click();
      cy.get('input[formControlName="quantity"]').type('100');
      cy.get('input[formControlName="lowStockThreshold"]').type('10');
      cy.get('input[formControlName="reorderAmount"]').type('50');
      cy.get('mat-select[formControlName="supplier"]').click().get('mat-option').first().click();
      cy.get('input[formControlName="expirationDate"]').type('2023-12-31');
      
      cy.get('button').contains('Save').click();
      
      // Verify the new item is in the grid
      cy.get('.ag-row').contains('TEST-SKU-001').should('be.visible');
    });
  
    it('should open the Request Stock modal', () => {
      cy.get('.ag-row').first().click();
      cy.contains('button', 'Request Stock').click();
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container').contains('h2', 'Request Stock').should('be.visible');
    });
  
    it('should request stock for an item', () => {
      cy.get('.ag-row').first().click();
      cy.contains('button', 'Request Stock').click();
      
      cy.get('input[formControlName="quantity"]').type('10');
      cy.get('button').contains('Request').click();
    });
  });