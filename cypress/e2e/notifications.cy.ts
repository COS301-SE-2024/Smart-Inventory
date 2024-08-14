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