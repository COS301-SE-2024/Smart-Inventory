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

describe('Notifications E2E Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/login');

    cy.get('input[name="username"]').type('u20418494@tuks.co.za');
    cy.get('input[name="password"]').type('Hawa1234@');
    cy.get('button[type="submit"]').contains('Sign in').click();

    cy.wait(5000);

    cy.url().then(url => {
      cy.log(`Current URL after login: ${url}`);
    });

    cy.url().then(url => {
      if (!url.includes('/dashboard')) {
        cy.log('Not on dashboard, attempting to navigate...');
        cy.visit('http://localhost:4200/dashboard');
      }
    });

    waitUntil(() => {
      return cy.document().then((doc) => {
        const grid = doc.querySelector('app-grid');
        const sidenav = doc.querySelector('.sidenav');
        return Boolean(grid || sidenav);
      });
    }, { timeout: 60000 });
  });

  // Function to wait for the loading overlay to disappear
  const waitForLoadingOverlay = () => {
    return cy.get('body', { timeout: 30000 }).should(($body) => {
      expect($body.find('.loading-overlay').length).to.equal(0);
    });
  };

  // Function to click the notifications icon, handling potential overlay issues
  const clickNotificationsIcon = () => {
    waitForLoadingOverlay();
    cy.get('button.toolbar-icon mat-icon', { timeout: 10000 }).contains('notifications').click({ force: true });
  };

  it('should open and close the notification panel', () => {
    clickNotificationsIcon();
    cy.get('.notification-panel', { timeout: 10000 }).should('be.visible');
    cy.get('button[mattooltip="Close"]').click();
    cy.get('.notification-panel').should('not.visible');
  });

  it('should display notifications', () => {
    clickNotificationsIcon();
    cy.get('.notification-content', { timeout: 10000 }).should('exist');
  });

  it('should filter notifications correctly', () => {
    clickNotificationsIcon();

    // Test filtering by notification type
    const notificationTypes = ['All', 'Inventory', 'Reports', 'Settings', 'Orders', 'Suppliers', 'Teams'];
    notificationTypes.forEach(type => {
      cy.get('.notification-tabs').contains(type).click();
      if (type === 'All') {
        cy.get('.notification-content').should('exist');
      } else {
        cy.get('.notification-content').each(($el) => {
          cy.wrap($el).find('[matlistitemtitle]').invoke('text').then((text) => {
            if (text.includes(type)) {
              cy.wrap($el).should('be.visible');
            }
            // else {
              // cy.wrap($el).should('not.be.visible');
            // }
          });
        });
      }
    });

    // Test read/unread filters
    cy.get('[data-cy="filter-menu-button"]').click();
    cy.get('[data-cy="filter-menu-content"]').within(() => {
      // Check initial state
      cy.get('[data-cy="read-checkbox"]').should('have.class', 'mat-mdc-checkbox-checked');
      cy.get('[data-cy="unread-checkbox"]').should('have.class', 'mat-mdc-checkbox-checked');

      // Uncheck 'Read'
      cy.get('[data-cy="read-checkbox"]').click();
      cy.get('[data-cy="read-checkbox"]').should('not.have.class', 'mat-mdc-checkbox-checked');
      cy.get('[data-cy="unread-checkbox"]').should('have.class', 'mat-mdc-checkbox-checked');
    });

    // Check that only unread notifications are visible
    cy.get('.notification-content').each(($el) => {
      cy.wrap($el).should('have.class', 'unread');
    });

    cy.get('[data-cy="filter-menu-button"]').click();
    cy.get('[data-cy="filter-menu-content"]').within(() => {
      // Check 'Read' and uncheck 'Unread'
      cy.get('[data-cy="read-checkbox"]').click();
      cy.get('[data-cy="unread-checkbox"]').click();
      cy.get('[data-cy="read-checkbox"]').should('have.class', 'mat-mdc-checkbox-checked');
      cy.get('[data-cy="unread-checkbox"]').should('not.have.class', 'mat-mdc-checkbox-checked');
    });

    // Check that only read notifications are visible
    cy.get('.notification-content').each(($el) => {
      cy.wrap($el).should('not.have.class', 'unread');
    });

    // Test show archived filter
    cy.get('[data-cy="filter-menu-button"]').click();
    cy.get('[data-cy="filter-menu-content"]').within(() => {
      cy.get('[data-cy="archived-checkbox"]').click();
      cy.get('[data-cy="archived-checkbox"]').should('have.class', 'mat-mdc-checkbox-checked');
    });
    cy.get('.notification-content').should('exist');
    cy.get('.notification-content.archived').should('exist');

    // Test marking as read/unread
    cy.get('.notification-content').first().within(() => {
      cy.get('button[ng-reflect-message="Mark as read"]').click();
    });
    cy.get('.notification-content').first().should('not.have.class', 'unread');

    cy.get('.notification-content').first().within(() => {
      cy.get('button[ng-reflect-message="Mark as unread"]').click();
    });
    cy.get('.notification-content').first().should('have.class', 'unread');

    // Test archiving
    cy.get('.notification-content').first().within(() => {
      cy.get('button[ng-reflect-message="Archive"]').click();
    });
    cy.get('.notification-content').first().should('have.class', 'archived');

    // Test unread count
    cy.get('.unread-count').invoke('text').then((text) => {
      const count = parseInt(text.match(/\d+/)[0]);
      cy.get('.notification-content.unread').should('have.length', count);
    });
  });

  // Helper function to get notification icon based on type
  function getNotificationIcon(type: string): string {
    switch (type) {
      case 'Inventory': return 'inventory';
      case 'Reports': return 'assessment';
      case 'Settings': return 'settings';
      case 'Orders': return 'shopping_cart';
      case 'Suppliers': return 'business';
      case 'Teams': return 'group';
      default: return 'notifications';
    }
  }

  it('should mark notification as read', () => {
    clickNotificationsIcon();
    cy.get('.notification-content').first().within(() => {
      cy.get('button[ng-reflect-message="Mark as read"]').first().click();
    });
    cy.get('.notification-content').first().should('not.have.class', 'unread');
  });

  it('should archive a notification', () => {
    clickNotificationsIcon();
    cy.get('.notification-content').first().within(() => {
      cy.get('button[ng-reflect-message="Archive"]').first().click();
    });
    cy.get('.notification-content').first().should('have.class', 'archived');
  });

  it('should update unread count', () => {
    cy.get('button.toolbar-icon mat-icon').contains('notifications').find('.mat-badge-content').invoke('text').then((text) => {
      const initialCount = parseInt(text);
      clickNotificationsIcon();
      cy.get('.notification-content').first().within(() => {
        cy.get('button[ng-reflect-message="Mark as read"]').first().click();
      });
      cy.get('button.toolbar-icon mat-icon').contains('notifications').find('.mat-badge-content').should('contain', initialCount - 1);
    });
  });

  it('should open notification details', () => {
    clickNotificationsIcon();
    cy.get('.notification-content').first().click();
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container button').contains('Close').click();
    cy.get('mat-dialog-container').should('not.exist');
  });
});

describe('Dashboard and Navigation E2E Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/login');

    cy.get('input[name="username"]').type('u20418494@tuks.co.za');
    cy.get('input[name="password"]').type('Hawa1234@');
    cy.get('button[type="submit"]').contains('Sign in').click();

    cy.wait(5000);

    cy.url().then(url => {
      cy.log(`URL after login: ${url}`);
    });

    cy.url().then(url => {
      if (!url.includes('/dashboard')) {
        cy.log('Not redirected to dashboard. Manually navigating...');
        cy.visit('http://localhost:4200/dashboard');
      }
    });

    cy.url().should('include', '/dashboard', { timeout: 20000 });

    cy.url().then(url => {
      if (!url.includes('/dashboard')) {
        cy.log('Failed to reach dashboard. Current page content:');
        cy.document().then((doc) => {
          cy.log(doc.body.innerHTML);
        });
      }
    });

    cy.contains('Inventory Levels', { timeout: 20000 }).should('be.visible');
  });

  it('should display key dashboard elements', () => {
    cy.get('.card', { timeout: 20000 }).should('have.length.at.least', 1);
    cy.contains('.card', 'Inventory Levels').should('be.visible');
    cy.contains('.card', 'Backorders').should('be.visible');
    cy.contains('.card', 'Avg Fulfillment Time').should('be.visible');
    cy.contains('.card', 'Top Seller').should('be.visible');
    cy.get('ag-charts-angular', { timeout: 20000 }).should('exist');
  });

  const waitForLoadingOverlay = () => {
    cy.get('.loading-overlay', { timeout: 13000 }).should('not.exist');
  };

  it('should display the sidebar', () => {
    cy.get('.sidenav').should('be.visible');
  });

  const pages = [
    { label: 'Dashboard', url: '/dashboard', content: 'Inventory Levels' },
    { label: 'Inventory', url: '/inventory', content: 'Inventory' },
    { label: 'Reports', url: '/reports', content: 'Reports' },
    { label: 'Team', url: '/team', content: 'Team' },
    { label: 'Suppliers', url: '/suppliers', content: 'Suppliers' },
    { label: 'Orders', url: '/orders', content: 'Orders' },
    { label: 'Help', url: '/help', content: 'Help' },
    { label: 'Settings', url: '/settings', content: 'Settings' }
  ];

  pages.forEach(page => {
    it(`should navigate to ${page.label} page`, () => {
      // Wait for the loading overlay to disappear before interacting with the sidebar
      waitForLoadingOverlay();

      // Click on the sidebar item
      cy.get('.sidenav').contains(page.label).click();

      // Wait for the loading overlay to disappear after navigation
      waitForLoadingOverlay();

      // Check if the URL and content are correct
      cy.url().should('include', page.url);
      cy.contains(page.content, { timeout: 10000 }).should('be.visible');
    });
  });

  it('should log out successfully', () => {
    // Store the current URL before logging out
    let currentUrl;
    cy.url().then(url => {
      currentUrl = url;
    });

    // Wait for the loading overlay to disappear
    waitForLoadingOverlay();

    // Try to click the Log Out button, with a fallback to force: true if needed
    cy.get('.sidenav').contains('Log Out').click({ timeout: 10000 }).then(() => {}, (err) => {
      if (err.message.includes('covered by another element')) {
        cy.get('.sidenav').contains('Log Out').click({ force: true });
      } else {
        throw err;
      }
    });

    // Wait for potential async operations
    cy.wait(5000);
    cy.get('.sidenav').should('not.exist');

    
  });
});

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