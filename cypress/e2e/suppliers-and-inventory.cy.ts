// cypress/e2e/suppliers-and-inventory.cy.ts

const waitUntil = (
  predicate: () => boolean | Cypress.Chainable<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Cypress.Chainable<boolean> => {
  const { timeout = 60000, interval = 1000 } = options;
  const startTime = Date.now();

  const checkCondition = (): Cypress.Chainable<boolean> => {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timed out waiting for condition');
    }

    const result = predicate();
    if (Cypress.isCy(result)) {
      return result.then((value: boolean) => {
        if (value) {
          return cy.wrap(true);
        }
        return cy.wait(interval).then(checkCondition);
      });
    } else if (result) {
      return cy.wrap(true);
    } else {
      return cy.wait(interval).then(checkCondition);
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
    
    // Wait for the modal to close with a timeout
    cy.get('.popup-content', { timeout: 5000 }).should('not.exist');
    // cy.get('.popup-content').should('not.exist');
  
    // Additional check to ensure the modal is fully closed
    // cy.get('body').then($body => {
    //   if ($body.find('.popup-content').length < 0) {
    //     cy.get('.popup-content').should('not.be.visible');
    //   }
    // });
    
    // Verify the new supplier is in the grid
    cy.get('.ag-row').contains('Test Company').should('be.visible');
  });

  it('should edit supplier address', () => {
    // Get the first row's address cell
    cy.get('.ag-row').first().find('.ag-cell[col-id="address"]').as('addressCell');
  
    // Store the original address
    cy.get('@addressCell').invoke('text').then((originalAddress) => {
      // Click the address cell to open the edit popup
      cy.get('@addressCell').click();
  
      // Wait for the popup to appear
      cy.get('.popup-overlay').should('be.visible');
      cy.get('.popup-content').should('be.visible');
  
      // Fill in the new address details
      cy.get('#edit_street').clear().type('456 New St');
      cy.get('#edit_city').clear().type('New City');
      cy.get('#edit_state_province').clear().type('New State');
      cy.get('#edit_postal_code').clear().type('54321');
      cy.get('#edit_country').clear().type('New Country');
  
      // Submit the form
      cy.get('.popup-content form').submit();
  
      // Wait for the popup to close and for any potential server updates
      cy.get('.popup-overlay').should('not.exist');
      cy.wait(2000); // Wait for potential server update
  
      // Verify the changes in the grid
      cy.get('@addressCell').should('contain', '456 New St');
      cy.get('@addressCell').should('contain', 'New City');
      cy.get('@addressCell').should('contain', 'New Country');
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

  // it('should filter suppliers', () => {
  //   // Assuming there's a search or filter input
  //   cy.get('input[placeholder="Search suppliers"]').type('Test Company');
    
  //   // Wait for the grid to update
  //   cy.wait(1000);
    
  //   // Check that the filtered results only show the matching supplier
  //   cy.get('.ag-row').should('have.length', 1);
  //   cy.get('.ag-row').should('contain', 'Test Company');
  // });

  // it('should sort suppliers', () => {
  //   // Click on the "Company Name" header to sort
  //   cy.get('.ag-header-cell').contains('Company Name').click();
    
  //   // Get the first company name
  //   cy.get('.ag-row').first().find('.ag-cell[col-id="company_name"]').invoke('text').then((firstCompany) => {
  //     // Click again to reverse sort
  //     cy.get('.ag-header-cell').contains('Company Name').click();
      
  //     // Get the new first company name
  //     cy.get('.ag-row').first().find('.ag-cell[col-id="company_name"]').invoke('text').then((newFirstCompany) => {
  //       // Assert that the order has changed
  //       expect(firstCompany).not.to.equal(newFirstCompany);
  //     });
  //   });
  // });
});

/* *************************************************************************** */

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
    // Check for the presence of the grid container
    cy.get('.ag-root-wrapper').should('exist');
  
    // Check for the presence of the header
    cy.get('.ag-header').should('exist');
  
    // Check for the presence of at least one header cell
    cy.get('.ag-header-cell').should('have.length.at.least', 1);
  
    // Check for the presence of the body container (even if empty)
    cy.get('.ag-body-viewport').should('exist');
  });

  it('should open the Add New Item modal', () => {
    cy.contains('span', 'Quick Actions').should('be.visible').click();
    cy.contains('span.mat-mdc-menu-item-text', '+ Add Item').click();
    cy.get('mat-dialog-container').should('be.visible')
      .contains('h2', 'Add Inventory Item').should('be.visible');
  });

  it('should add a new inventory item', () => {
    const addSupplier = () => {
      // ... (keep the addSupplier function as is)
    };
  
    const addInventoryItem = () => {
      cy.contains('span', 'Quick Actions').click();
      cy.contains('span.mat-mdc-menu-item-text', '+ Add Item').click();
      
      cy.get('mat-dialog-container').should('be.visible');
    
      cy.get('input[formControlName="upc"]').type('123456789');
      cy.get('input[formControlName="sku"]').type('TEST-SKU-001');
      cy.get('input[formControlName="description"]').type('Test Item');
      
      cy.get('mat-select[formControlName="category"]').click();
      cy.get('mat-option').contains('Food: Non-Perishable').click();
      
      cy.get('input[formControlName="quantity"]').type('100');
      cy.get('input[formControlName="lowStockThreshold"]').type('10');
      cy.get('input[formControlName="reorderAmount"]').type('50');
      
      cy.get('mat-select[formControlName="supplier"]').as('supplierSelect').click();
      
      // Wait for mat-option elements to appear
      cy.get('mat-option', { timeout: 10000 }).should('exist').then($options => {
        if ($options.length === 0) {
          // No suppliers found, cancel and add a new supplier
          cy.get('button').contains('Cancel').click();
          cy.get('mat-dialog-container').should('not.exist');
          
          // Navigate to supplier page
          cy.get('.sidenav').contains('Suppliers').click();
          cy.url().should('include', '/suppliers');
          
          // Add a new supplier
          addSupplier();
          
          // Navigate back to inventory page
          cy.get('.sidenav').contains('Inventory').click();
          cy.url().should('include', '/inventory');
          
          // Retry adding inventory item
          addInventoryItem();
        } else {
          // Select the first available supplier option
          cy.get('mat-option').first().click();
          
          cy.get('@supplierSelect').find('.mat-select-value-text').should('not.be.empty');
          
          cy.get('input[formControlName="expirationDate"]').type('2023-12-31');
          
          cy.get('button').contains('Save').click();
          
          cy.get('mat-dialog-container').should('not.exist');
          
          cy.get('.ag-row').contains('TEST-SKU-001').should('be.visible');
        }
      });
    };
  
    addInventoryItem();
  });

  it('should open the Request Stock modal', () => {
    cy.get('.ag-row').first().find('.ag-cell').first().click();
    cy.contains('span', 'Quick Actions').click();
    cy.contains('span.mat-mdc-menu-item-text', 'Request Stock').click();
    
    cy.get('mat-dialog-container').should('be.visible')
      .contains('h2', 'Request Stock').should('be.visible');
  });
  
  it('should request stock for an item', () => {
    cy.get('.ag-row').first().find('.ag-cell').first().click();
    cy.contains('span', 'Quick Actions').click();
    cy.contains('span.mat-mdc-menu-item-text', 'Request Stock').click();
    
    cy.get('input[formControlName="quantity"]').type('10');
    cy.get('button').contains('Request').click();
    
    // cy.get('mat-snack-bar-container', { timeout: 10000 }).should('contain', 'Stock request submitted successfully');
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('should edit the first inventory item and then revert the change', () => {
    // Find the first row in the grid
    cy.get('.ag-row').first().within(() => {
      // Find the description cell within the first row
      cy.get('.ag-cell[col-id="description"]').as('descriptionCell');
  
      cy.get('@descriptionCell').invoke('text').then((originalDescription) => {
        // Step 1: Change the description to "Updated Item"
        cy.get('@descriptionCell').dblclick();
        cy.get('@descriptionCell').find('input').should('exist').clear().type('Updated Item{enter}');
  
        // Verify the changes
        cy.get('@descriptionCell').should('contain', 'Updated Item');
  
        // Step 2: Change the description back to the original
        cy.get('@descriptionCell').dblclick();
        cy.get('@descriptionCell').find('input').should('exist').clear().type(`${originalDescription}{enter}`);
  
        // Verify the description is back to the original
        cy.get('@descriptionCell').should('contain', originalDescription);
      });
    });
  });

  it('should delete an inventory item', () => {
    cy.get('.ag-row').its('length').then((initialCount) => {
      // Click any cell in the first row to select it
      cy.get('.ag-row').first().find('.ag-cell').first().click();
  
      // Open Quick Actions menu
      cy.contains('span', 'Quick Actions').click();
  
      // Click on the Remove Item option
      cy.contains('span.mat-mdc-menu-item-text', 'Remove Item').click();
  
      // Check if the confirmation dialog is visible
      cy.get('mat-dialog-container').should('be.visible');
  
      // Confirm the deletion
      cy.get('mat-dialog-container').contains('button', 'Yes').click();
  
      // Verify that the row count has decreased
      cy.get('.ag-row').should('have.length', initialCount - 1);
    });
  });
});