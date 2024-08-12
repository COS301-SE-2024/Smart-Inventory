// cypress/e2e/inventory-report-e2e.cy.ts

describe('Inventory Report E2E Test', () => {
    beforeEach(() => {
      // Login
      cy.visit('http://localhost:4200/login');
      cy.get('input[name="username"]').type('bryce.sukhdeo@gmail.com');
      cy.get('input[name="password"]').type('Lovemore!7');
      cy.get('button[type="submit"]').contains('Sign in').click();
  
      cy.wait(5000);
      cy.url().then(url => {
        cy.log(`URL after login: ${url}`);

      });
  
      // Check if we're on the dashboard, if not, navigate there
      cy.url().then(url => {
        if (!url.includes('/dashboard')) {
          cy.log('Not on dashboard, attempting to navigate...');
          cy.visit('http://localhost:4200/dashboard');
        }
      });
  
      // Wait for dashboard content to be visible
      cy.log('Successfully loaded dashboard content');  
      // Verify we're on the Reports page
      cy.contains('Reports', { timeout: 20000 }).should('be.visible');
  
      // Log the content of the page if "Reports" is not found
      cy.document().then((doc) => {
        if (!doc.body.innerText.includes('Reports')) {
          cy.log('Failed to find "Reports". Current page content:');
          cy.log(doc.body.innerHTML);
        }
      });
    });
  
    it('should navigate to and interact with Inventory Report', () => {
      // Navigate to Inventory Report 
      cy.visit('http://localhost:4200/inventoryReport');
      cy.contains('Inventory Report', { timeout: 20000 }).should('be.visible');
  
  
      // Check for correct column headers in the grid
      const inventoryColumns = [
        'SKU', 'Description', 'Category', 'Quantity',
        'Supplier', 'Expiration Date', 'Requests', 'Requests Quantity'
      ];
      inventoryColumns.forEach(column => {
        cy.get('.ag-header-cell').contains(column).should('be.visible');
      });
      

      // Check for chart components
      cy.get('[data-cy="graph1"] > .ag-chart-wrapper > canvas');
      cy.get('[data-cy="graph2"] > .ag-chart-wrapper > canvas');
      cy.get('[data-cy="graph3"] > .ag-chart-wrapper > canvas');  
      // Test grid functionality
      cy.get('.ag-center-cols-container .ag-row').should('have.length.greaterThan', 0);
  
      // Test sorting (example with SKU column)
      cy.get('.ag-header-cell').contains('SKU').click();
  
      // Test filtering (example with SKU column)
      cy.get('.ag-column-first > .ag-header-cell-comp-wrapper > .ag-cell-label-container > .ag-header-cell-label');
      cy.get('.ag-column-first > .ag-header-cell-comp-wrapper > .ag-cell-label-container > .ag-header-cell-label');
      cy.get('.ag-center-cols-container .ag-row').should('have.length.lessThan', 10);
      cy.get('[style="left: 0px; width: calc((11.1111% - 13.3333px) * 7 + 90px); top: calc((29vh + 15px) * 4); height: calc(58vh + 15px);"] > .mat-grid-tile-content > [style="padding: 10px 10px 10px 10px; height: 100%; width: 100%;"] > .mat-mdc-card > ag-charts-angular > .ag-chart-wrapper > canvas');
      cy.get('[style="left: 0px; width: calc((11.1111% - 13.3333px) * 7 + 90px); top: calc((29vh + 15px) * 6); height: calc(58vh + 15px);"] > .mat-grid-tile-content > [style="padding: 10px 10px 10px 10px; height: 100%; width: 100%;"] > .mat-mdc-card > ag-charts-angular > .ag-chart-wrapper > canvas');
      cy.get('.mat-mdc-card-content');
      // Clear filter
  
      // Navigate back to Reports page
      cy.contains('Back to reports').click();
      cy.url().should('include', '/reports');
      cy.visit('http://localhost:4200/activityReport');

      cy.get('[style="left: 0px; width: calc((11.1111% - 13.3333px) * 3 + 30px); top: 0px; height: calc(40vh + 15px);"] > .mat-grid-tile-content > [style="padding: 10px 10px 10px 10px; height: 100%; width: 100%;"] > .mat-mdc-card');
      cy.get('[style="left: calc((11.1111% - 13.3333px + 15px) * 3); width: calc((11.1111% - 13.3333px) * 3 + 30px); top: 0px; height: calc(40vh + 15px);"] > .mat-grid-tile-content > [style="padding: 10px 10px 10px 10px; height: 100%; width: 100%;"] > .mat-mdc-card');
      cy.get('[style="left: calc((11.1111% - 13.3333px + 15px) * 3); width: calc((11.1111% - 13.3333px) * 3 + 30px); top: 0px; height: calc(40vh + 15px);"] > .mat-grid-tile-content > [style="padding: 10px 10px 10px 10px; height: 100%; width: 100%;"] > .mat-mdc-card');

      cy.contains('Back to reports').click();
      cy.url().should('include', '/reports');

      cy.visit('http://localhost:4200/orderReport');
      cy.get('app-grid');
      cy.get('[ng-reflect-colspan="2"] > .mat-grid-tile-content > div > .mat-mdc-card');
      cy.get('[style="position: relative; width: 548px; height: 500px; padding: 0px; margin: 0px; border-width: 0px;"] > canvas');

      cy.contains('Back to reports').click();
      cy.url().should('include', '/reports');
      cy.visit('http://localhost:4200/supplierReport');

      cy.get('.card-wrapper > :nth-child(1)');
      cy.get('.card-wrapper > :nth-child(2)');
      cy.get('.card-wrapper > :nth-child(3)');
      cy.get('.card-wrapper > :nth-child(4)');
      cy.get('app-grid');
      cy.get('[style="position: relative; width: 800px; height: 396px; padding: 0px; margin: 0px; border-width: 0px;"] > canvas');
      cy.get('[style="position: relative; width: 520px; height: 363px; padding: 0px; margin: 0px; border-width: 0px;"] > canvas');

      cy.contains('Back to reports').click();
      cy.url().should('include', '/reports');

    });
});