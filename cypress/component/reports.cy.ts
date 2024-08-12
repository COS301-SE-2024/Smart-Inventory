// cypress/e2e/inventory-report-e2e.cy.ts

describe('Inventory Report E2E Test', () => {
  beforeEach(() => {
    // Login
    cy.visit('http://localhost:4200/login');
    cy.get('input[name="username"]').type('u21491578@tuks.co.za');
    cy.get('input[name="password"]').type('Lovemore!7');
    cy.get('button[type="submit"]').contains('Sign in').click();

    // Wait for dashboard to load
    cy.url().should('include', '/dashboard', { timeout: 20000 });

    // Navigate to Reports page
    cy.get('.sidenav').contains('Reports').click();
    cy.url().should('include', '/reports', { timeout: 10000 });
    cy.contains('Reports', { timeout: 10000 }).should('be.visible');

    // Navigate to Inventory Report
    cy.contains('Inventory Report')
      .parent()
      .contains('View Full Report')
      .click();
    cy.url().should('include', '/inventoryReport', { timeout: 10000 });
  });

  it('should display Inventory Report content and allow interactions', () => {
    // Verify report title
    cy.contains('Inventory Report').should('be.visible');

    // Check for key metrics
    const metrics = [
      'Total inventory items:',
      'Low stock items:',
      'Out of stock items:',
      'Inventory value:',
      'Inventory turnover rate:'
    ];
    metrics.forEach(metric => {
      cy.contains(metric).should('be.visible');
    });

    // Check for correct column headers in the grid
    const inventoryColumns = [
      'SKU', 'Description', 'Category', 'Quantity',
      'Low Stock Threshold', 'Reorder Amount', 'Unit Price', 'Total Value'
    ];
    inventoryColumns.forEach(column => {
      cy.get('.ag-header-cell').contains(column).should('be.visible');
    });

    // Check for chart components
    cy.get('app-stackedbarchart').should('exist');
    cy.get('app-scatterplot').should('exist');

    // Test grid functionality
    cy.get('.ag-center-cols-container .ag-row').should('have.length.greaterThan', 0);

    // Test sorting (example with SKU column)
    cy.get('.ag-header-cell').contains('SKU').click();
    cy.get('.ag-header-cell').contains('SKU').should('have.class', 'ag-header-cell-sorted-asc');

    // Test filtering (example with SKU column)
    cy.get('.ag-header-cell').contains('SKU').find('.ag-header-cell-menu-button').click();
    cy.get('.ag-filter-filter').type('ABC123');
    cy.get('button').contains('Apply').click();
    cy.get('.ag-center-cols-container .ag-row').should('have.length.lessThan', 10);

    // Clear filter
    cy.get('.ag-header-cell').contains('SKU').find('.ag-header-cell-menu-button').click();
    cy.get('button').contains('Clear').click();

    // Test chart interactions (this will depend on your specific chart implementation)
    cy.get('app-stackedbarchart').click();
    // Add assertions based on expected behavior when clicking the chart

    cy.get('app-scatterplot').click();
    // Add assertions based on expected behavior when clicking the chart

    // Navigate back to Reports page
    cy.contains('Back to reports').click();
    cy.url().should('include', '/reports');
  });

  it('should log out successfully', () => {
    cy.get('.sidenav').contains('Log Out').click();
    cy.url().should('include', '/login', { timeout: 10000 });
  });
});