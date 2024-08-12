// cypress/e2e/smart-inventory.cy.ts

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
        cy.get('.sidenav').contains(page.label).click();
        cy.url().should('include', page.url);
        cy.contains(page.content, { timeout: 10000 }).should('be.visible');
      });
    });
  
    it('should expand sidebar on hover', () => {
      cy.get('.sidenav').should('have.css', 'width', '50px');
      cy.get('.sidenav').trigger('mouseover');
      
      // Wait for potential transition
      cy.wait(1000);
      
      cy.get('.sidenav').invoke('css', 'width').then((width) => {
        cy.log(`Sidebar width after hover: ${width}`);
      });
      
      cy.get('.sidenav').should('have.css', 'width', '100px');
    });
  
    it('should log out successfully', () => {
      cy.get('.sidenav').contains('Log Out').click();
      
      // Wait for potential async operations
      cy.wait(5000);
      
      cy.url().then(url => {
        cy.log(`URL after logout attempt: ${url}`);
      });
      
      cy.url().should('include', '/login');
    });
});
