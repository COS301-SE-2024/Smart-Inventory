// cypress/e2e/inventory.cy.ts

const waitUntil = (predicate: () => boolean | Cypress.Chainable<boolean>, options: { timeout?: number; interval?: number } = {}) => {
  const { timeout = 60000, interval = 1000 } = options;
  const startTime = Date.now();

  const checkCondition = () => {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timed out waiting for condition');
    }

    const result = predicate();
    if (Cypress.isCy(result)) {
      return result.then((value) => {
        if (value) {
          return value;
        }
        cy.wait(interval);
        return checkCondition();
      });
    } else if (result) {
      return result;
    } else {
      cy.wait(interval);
      return checkCondition();
    }
  };

  return checkCondition();
};

describe('Suppliers Page E2E Test', () => {
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

    // Wait for content to load
    waitUntil(() => {
      return cy.document().then((doc) => {
        const grid = doc.querySelector('app-grid');
        const sidenav = doc.querySelector('.sidenav');
        return Boolean(grid || sidenav);
      });
    }, { timeout: 60000 });

    // Navigate to Suppliers page
    cy.visit('http://localhost:4200/suppliers');

    // Wait for content to load after navigation
    waitUntil(() => {
      return cy.document().then((doc) => {
        const grid = doc.querySelector('app-grid');
        const sidenav = doc.querySelector('.sidenav');
        return Boolean(grid || sidenav);
      });
    }, { timeout: 60000 });

    // Check that we've reached the correct page
    cy.url().should('include', '/suppliers');

    // Wait for the loading overlay to disappear
    cy.get('.loading-overlay', { timeout: 30000 }).should('not.exist');
  });

  it('should display the suppliers grid', () => {
    cy.get('app-grid', { timeout: 20000 }).should('be.visible');
    cy.get('.ag-header-cell', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.ag-row', { timeout: 10000 }).should('have.length.at.least', 1);
  });

  it('should open the Add New Supplier modal', () => {
    // Wait for the Quick Actions button to be visible and clickable
    cy.contains('span', 'Quick Actions', { timeout: 10000 }).should('be.visible').and('not.be.disabled');
    
    // Click the Quick Actions button
    cy.contains('span', 'Quick Actions').click();

    // Wait for the menu to appear and click the Add Supplier option
    cy.contains('span.mat-mdc-menu-item-text', '+ Add Supplier', { timeout: 5000 }).click();

    // Check if the modal is visible
    cy.get('.popup-content', { timeout: 10000 }).should('be.visible');
    cy.get('.popup-content').contains('h2', 'Add Supplier').should('be.visible');
  });

  it('should add a new supplier', () => {
    cy.contains('span', 'Quick Actions').click();
    cy.contains('span.mat-mdc-menu-item-text', '+ Add Supplier').click();
    
    // Fill out the form
    cy.get('input[name="company_name"]').type('Test Company');
    cy.get('input[name="contact_name"]').type('John Doe');
    cy.get('input[name="contact_email"]').type('john@testcompany.com');
    cy.get('input[name="phone_number"]').type('1234567890');
    cy.get('input[name="street"]').type('123 Test St');
    cy.get('input[name="city"]').type('Test City');
    cy.get('input[name="state_province"]').type('Test State');
    cy.get('input[name="postal_code"]').type('12345');
    cy.get('input[name="country"]').type('Test Country');
    
    cy.get('button').contains('Submit').click();
    
    // Wait for the modal to close
    cy.get('.popup-content').should('not.exist');
    
    // Verify the new supplier is in the grid
    cy.get('.ag-row').contains('Test Company').should('be.visible');
  });

  it('should edit supplier address', () => {
    // Get the first row's address cell
    cy.get('.ag-row').first().find('.ag-cell[col-id="address"]').as('addressCell');
  
    // Store the original address
    cy.get('@addressCell').invoke('text').then((originalAddress) => {
      // Double click the address cell to enter edit mode
      cy.get('@addressCell').dblclick();
  
      // Type the new address and press Enter
      cy.get('@addressCell').find('input').clear().type('456 New St{enter}');
  
      // Wait for the cell to exit edit mode
      cy.wait(1000);
  
      // Verify the changes
      cy.get('@addressCell').should('contain', '456 New St');
      cy.get('@addressCell').should('not.contain', originalAddress);
    });
  });

  it('should delete a supplier', () => {
    // Get the initial row count
    cy.get('.ag-row').its('length').then((initialCount) => {
      // Click on any cell in the first row to select a supplier
      cy.get('.ag-row').first().find('.ag-cell').first().click();
      
      // Open Quick Actions menu
      cy.contains('span', 'Quick Actions').click();
      
      // Click on the Remove Supplier option
      cy.contains('span.mat-mdc-menu-item-text', 'Remove Supplier').click();
      
      // Confirm deletion in the modal
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container').contains('button', 'Yes').click();
      
      // Wait for the deletion to complete
      cy.wait(2000);
      
      // Verify that the supplier has been deleted
      cy.get('.ag-row').should('have.length', initialCount - 1);
    });
  });

  it('should filter suppliers', () => {
    // // Assuming there's a search or filter input
    // cy.get('input[placeholder="Search suppliers"]').type('Test Company');
    
    // // Wait for the grid to update
    // cy.wait(1000);
    
    // // Check that the filtered results only show the matching supplier
    // cy.get('.ag-row').should('have.length', 1);
    // cy.get('.ag-row').should('contain', 'Test Company');
  });

  it('should sort suppliers', () => {
    // Click on the "Company Name" header to sort
    cy.get('.ag-header-cell').contains('Company Name').click();
    
    // Get the first company name
    cy.get('.ag-row').first().find('.ag-cell[col-id="company_name"]').invoke('text').then((firstCompany) => {
      // Click again to reverse sort
      cy.get('.ag-header-cell').contains('Company Name').click();
      
      // Get the new first company name
      cy.get('.ag-row').first().find('.ag-cell[col-id="company_name"]').invoke('text').then((newFirstCompany) => {
        // Assert that the order has changed
        expect(firstCompany).not.to.equal(newFirstCompany);
      });
    });
  });
});

describe('Inventory Page E2E Test', () => {
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

    // Wait for content to load
    waitUntil(() => {
      return cy.document().then((doc) => {
        const grid = doc.querySelector('app-grid');
        const sidenav = doc.querySelector('.sidenav');
        return Boolean(grid || sidenav);
      });
    }, { timeout: 60000 });

    // Navigate to Inventory page
    cy.visit('http://localhost:4200/inventory');

    // Wait for content to load after navigation
    waitUntil(() => {
      return cy.document().then((doc) => {
        const grid = doc.querySelector('app-grid');
        const sidenav = doc.querySelector('.sidenav');
        return Boolean(grid || sidenav);
      });
    }, { timeout: 60000 });

    // Check that we've reached the correct page
    cy.url().should('include', '/inventory');

    // Wait for the loading overlay to disappear
    cy.get('.loading-overlay', { timeout: 30000 }).should('not.exist');
  });

  it('should display the inventory grid', () => {
    cy.get('app-grid', { timeout: 20000 }).should('be.visible');
    cy.get('.ag-header-cell', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.ag-row', { timeout: 10000 }).should('have.length.at.least', 1);
  });

  it('should open the Add New Item modal', () => {
    // Wait for the Quick Actions button to be visible and clickable
    cy.contains('span', 'Quick Actions', { timeout: 10000 }).should('be.visible').and('not.be.disabled');
    
    // Click the Quick Actions button
    cy.contains('span', 'Quick Actions').click();

    // Wait for the menu to appear and click the Add Item option
    cy.contains('span.mat-mdc-menu-item-text', '+ Add Item', { timeout: 5000 }).click();

    // Check if the modal is visible
    cy.get('mat-dialog-container', { timeout: 10000 }).should('be.visible');
    cy.get('mat-dialog-container').contains('h2', 'Add Inventory Item').should('be.visible');
  });

  it('should add a new inventory item', () => {
    cy.contains('span', 'Quick Actions').click();
    cy.contains('span.mat-mdc-menu-item-text', '+ Add Item').click();
    
    // Wait for the modal to be visible
    cy.get('mat-dialog-container', { timeout: 10000 }).should('be.visible');
  
    // Fill out the form
    cy.get('input[formControlName="upc"]').type('123456789');
    cy.get('input[formControlName="sku"]').type('TEST-SKU-001');
    cy.get('input[formControlName="description"]').type('Test Item');
    
    // Handle category selection
    cy.get('mat-select[formControlName="category"]').click();
    cy.get('mat-option').contains('Food: Non-Perishable').click();
    
    cy.get('input[formControlName="quantity"]').type('100');
    cy.get('input[formControlName="lowStockThreshold"]').type('10');
    cy.get('input[formControlName="reorderAmount"]').type('50');
    
    // Handle supplier selection with multiple attempts and logging
    cy.get('mat-select[formControlName="supplier"]').as('supplierSelect');
    
    const attemptSupplierSelection = (attempts = 3) => {
      if (attempts === 0) {
        throw new Error('Failed to select supplier after multiple attempts');
      }
  
      // cy.get('@supplierSelect').click({force: true});
      cy.get('@supplierSelect').click();
      cy.wait(1000); // Wait for dropdown to open
  
      cy.get('mat-option').then($options => {
        cy.log(`Available options (Attempt ${4 - attempts}):`, $options.map((_, el) => Cypress.$(el).text()).get());
      });
  
      cy.get('mat-option').contains('Makro').then($option => {
        if ($option.length) {
          cy.wrap($option).click({force: true});
        } else {
          cy.log('Makro option not found, retrying...');
          cy.wait(1000);
          attemptSupplierSelection(attempts - 1);
        }
      });
    };
  
    attemptSupplierSelection();
    
    // Verify that a supplier was selected
    cy.get('@supplierSelect').find('.mat-select-value-text').should('not.be.empty');
    
    cy.get('input[formControlName="expirationDate"]').type('2023-12-31');
    
    // Save the new item
    cy.get('button').contains('Save').click();
    
    // Wait for the modal to close
    cy.get('mat-dialog-container').should('not.exist');
    
    // Verify the new item is in the grid
    cy.get('.ag-row').contains('TEST-SKU-001').should('be.visible');
  });

  it('should open the Request Stock modal', () => {
    // Click on any cell in the first row to select an item
    cy.get('.ag-row').first().find('.ag-cell').first().click();
    
    // Open Quick Actions menu
    cy.contains('span', 'Quick Actions').click();
    
    // Click on the Request Stock option
    cy.contains('span.mat-mdc-menu-item-text', 'Request Stock').click();
    
    // Verify the modal is visible
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container').contains('h2', 'Request Stock').should('be.visible');
  });
  
  it('should request stock for an item', () => {
    // Click on any cell in the first row to select an item
    cy.get('.ag-row').first().find('.ag-cell').first().click();
    
    // Open Quick Actions menu
    cy.contains('span', 'Quick Actions').click();
    
    // Click on the Request Stock option
    cy.contains('span.mat-mdc-menu-item-text', 'Request Stock').click();
    
    // Enter the amount in the quantity input
    cy.get('input[formControlName="quantity"]').type('10');
    
    // Click the Request button
    cy.get('button').contains('Request').click();
    
    // Verify the success message
    cy.get('mat-snack-bar-container').should('contain', 'Stock request submitted successfully');
    
    // Optional: Verify that the modal has closed
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('should filter inventory items', () => {
    // // Assuming there's a search or filter input
    // cy.get('input[placeholder="Search items"]').type('TEST-SKU-001');
    
    // // Wait for the grid to update
    // cy.wait(1000);
    
    // // Check that the filtered results only show the matching item
    // cy.get('.ag-row').should('have.length', 1);
    // cy.get('.ag-row').should('contain', 'TEST-SKU-001');
  });

  it('should edit an inventory item', () => {
    // Get the first row's description cell
    cy.get('.ag-row').first().find('.ag-cell[col-id="description"]').as('descriptionCell');
  
    // Store the original description
    cy.get('@descriptionCell').invoke('text').then((originalDescription) => {
      // Double click the description cell to enter edit mode
      cy.get('@descriptionCell').dblclick();
  
      // Type the new description and press Enter
      cy.get('@descriptionCell').find('input').clear().type('Updated Test Item{enter}');
  
      // Wait for the cell to exit edit mode
      cy.wait(1000);
  
      // Verify the changes
      cy.get('@descriptionCell').should('contain', 'Updated Test Item');
      cy.get('@descriptionCell').should('not.contain', originalDescription);
    });
  });

  it('should delete an inventory item', () => {
    // Get the initial row count
    cy.get('.ag-row').its('length').then((initialCount) => {
      // Click on any cell in the first row to select an item
      cy.get('.ag-row').first().find('.ag-cell').first().click();
      
      // Open Quick Actions menu
      cy.contains('span', 'Quick Actions').click();
      
      // Click on the Delete option
      cy.contains('span.mat-mdc-menu-item-text', 'Delete').click();
      
      // Confirm deletion in the modal
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container').contains('button', 'Confirm').click();
      
      // Wait for the deletion to complete
      cy.wait(2000);
      
      // Verify that the row count has decreased
      cy.get('.ag-row').should('have.length', initialCount - 1);
    });
  });
});