// cypress/component/order-report.component.cy.ts

import { OrderReportComponent } from '../../src/app/components/reports/order-report/order-report.component';
import { MountConfig, mount } from 'cypress/angular';
import { TitleService } from '../../src/app/components/header/title.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('OrderReportComponent', () => {
  const mountConfig: MountConfig<OrderReportComponent> = {
    declarations: [],
    imports: [
      OrderReportComponent,
      TitleService,
      Router
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
    mount(OrderReportComponent, mountConfig);
  });

  it('should display the order report title', () => {
    cy.contains('Order Report').should('be.visible');
  });

  it('should display the grid component', () => {
    cy.get('app-grid').should('exist');
  });

  it('should display key metrics', () => {
    cy.contains('Total orders:').should('be.visible');
    cy.contains('Orders in progress:').should('be.visible');
    cy.contains('Average order time:').should('be.visible');
    cy.contains('Supplier performance index:').should('be.visible');
    cy.contains('Order cost analysis:').should('be.visible');
  });

  it('should have correct column definitions in the grid', () => {
    const expectedColumns = [
      'Order ID', 'Issued Date', 'Expected Date', 'Supplier',
      'Address', 'Order Cost', 'Received Date', 'Status', 'Quote Status'
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

  it('should update metrics based on order data', () => {
    // You may need to mock the fetchOrders method to return consistent data
    cy.contains('Total orders: 12').should('be.visible');
    cy.contains('Orders in progress: 2').should('be.visible');
    // Add more specific metric checks based on your mock data
  });

  it('should update supplier quote statuses', () => {
    cy.get('.ag-row').contains('Accepted').should('exist');
    cy.get('.ag-row').contains('Pending').should('exist');
  });

  // Add more tests as needed for specific functionalities
});