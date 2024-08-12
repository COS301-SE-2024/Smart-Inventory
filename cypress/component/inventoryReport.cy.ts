// cypress/component/inventory-report.component.cy.ts

import { InventoryReportComponent } from '../../src/app/components/reports/inventory-report/inventory-report.component';
import { MountConfig, mount } from 'cypress/angular';
import { TitleService } from '../../src/app/components/header/title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('InventoryReportComponent', () => {
  const mountConfig: MountConfig<InventoryReportComponent> = {
    declarations: [],
    imports: [
      HttpClientModule,
      // Add other necessary imports here
    ],
    providers: [
      TitleService,
      {
        provide: Router,
        useValue: {
          navigate: cy.stub().as('routerNavigate')
        }
      },
      {
        provide: ActivatedRoute,
        useValue: {}
      }
    ]
  };

  beforeEach(() => {
    // Mock any necessary API calls
    cy.intercept('GET', '**/inventory', { fixture: 'inventory.json' }).as('getInventory');
    mount(InventoryReportComponent, mountConfig);
    cy.wait('@getInventory');
  });

  it('should display the inventory report title', () => {
    cy.contains('Inventory Report').should('be.visible');
  });

  it('should display the grid component', () => {
    cy.get('app-grid').should('exist');
  });

  it('should display key metrics', () => {
    cy.contains('Total inventory items:').should('be.visible');
    cy.contains('Low stock items:').should('be.visible');
    cy.contains('Out of stock items:').should('be.visible');
    cy.contains('Inventory value:').should('be.visible');
    cy.contains('Inventory turnover rate:').should('be.visible');
  });

  it('should have correct column definitions in the grid', () => {
    const expectedColumns = [
      'SKU', 'Description', 'Category', 'Quantity',
      'Low Stock Threshold', 'Reorder Amount', 'Unit Price', 'Total Value'
    ];

    expectedColumns.forEach(column => {
      cy.get('.ag-header-cell').contains(column).should('be.visible');
    });
  });

  it('should display chart components', () => {
    cy.get('app-stackedbarchart').should('exist');
    cy.get('app-scatterplot').should('exist');
  });

  it('should navigate back to reports when back button is clicked', () => {
    cy.contains('Back to reports').click();
    cy.get('@routerNavigate').should('have.been.calledWith', ['/reports']);
  });

  it('should update metrics based on inventory data', () => {
    cy.contains('Total inventory items:').should('include.text');
    cy.contains('Low stock items:').should('include.text');
    cy.contains('Out of stock items:').should('include.text');
    cy.contains('Inventory value:').should('include.text');
    // Add more specific metric checks based on your mock data
  });

  it('should highlight low stock items', () => {
    // Assuming you have a CSS class for low stock items
    cy.get('.low-stock-item').should('exist');
  });

  it('should display correct inventory value calculation', () => {
    // This test would depend on your specific implementation
    cy.get('.total-inventory-value').should('exist');
  });

  // Add more tests as needed for specific functionalities of the Inventory Report
});