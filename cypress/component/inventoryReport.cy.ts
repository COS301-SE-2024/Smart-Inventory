import { InventoryReportComponent } from '../../src/app/components/reports/inventory-report/inventory-report.component';
// import { InventoryReportComponent } from '../../src/app/pages/inventory-report/inventory-report.component';
import { TitleService } from '../../src/app/components/header/title.service';
import { ChartDataService } from '../../src/app/services/chart-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as amplifyAuth from 'aws-amplify/auth';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { of } from 'rxjs';

describe('InventoryReportComponent', () => {
  let mockTitleService: Partial<TitleService>;
  let mockRouter: Partial<Router>;
  let mockChartDataService: Partial<ChartDataService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    mockTitleService = {
      updateTitle: cy.stub().as('updateTitleStub')
    };

    mockRouter = {
      navigate: cy.stub().as('routerNavigateStub')
    };

    mockChartDataService = {
      setPieData: cy.stub().as('setPieDataStub'),
      setBarData: cy.stub().as('setBarDataStub')
    };

    mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      snapshot: {
        paramMap: {
          get: cy.stub().returns(null)
        }
      }
    };

    // Mock Amplify auth
    cy.stub(amplifyAuth, 'fetchAuthSession').resolves({
      tokens: {
        accessToken: {
          toString: () => 'mock-access-token'
        }
      },
      credentials: {}
    });

    // Mock AWS SDK clients
    cy.stub(LambdaClient.prototype, 'send').resolves({
      Payload: new TextEncoder().encode(JSON.stringify({
        statusCode: 200,
        body: JSON.stringify([
          {
            inventoryID: '1',
            SKU: 'ITEM1',
            category: 'Category1',
            description: 'Item 1',
            quantity: 100,
            supplier: 'Supplier1',
            expirationDate: '2023-12-31',
            lowStockThreshold: 20,
            reorderFreq: 30
          }
        ])
      }))
    });

    cy.stub(CognitoIdentityProviderClient.prototype, 'send').resolves({
      UserAttributes: [
        { Name: 'custom:tenentId', Value: 'mock-tenant-id' }
      ]
    });

    cy.mount(InventoryReportComponent, {
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TitleService, useValue: mockTitleService },
        { provide: Router, useValue: mockRouter },
        { provide: ChartDataService, useValue: mockChartDataService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).as('component');

    // Wait for component to initialize
    cy.get('@component').then((wrapper) => {
      return new Cypress.Promise((resolve) => {
        const checkInitialization = () => {
          const component = wrapper.component as InventoryReportComponent;
          if (!component.isLoading) {
            resolve();
          } else {
            setTimeout(checkInitialization, 100);
          }
        };
        checkInitialization();
      });
    });
  });

  it('should initialize and load data', () => {
    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as InventoryReportComponent;
      
      expect(component.isLoading).to.be.false;
      expect(component.rowData).to.have.length(1);
      expect(component.rowData[0]).to.include({
        sku: 'ITEM1',
        category: 'Category1',
        description: 'Item 1',
        quantity: 100
      });
    });

    cy.get('@updateTitleStub').should('have.been.calledWith', 'Inventory Report');
  });

  it('should setup charts', () => {
    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as InventoryReportComponent;
      
      expect(component.options1).to.not.be.undefined;
      expect(component.options2).to.not.be.undefined;
      expect(component.options3).to.not.be.undefined;
      expect(component.options4).to.not.be.undefined;
      expect(component.options5).to.not.be.undefined;
    });

    cy.get('@setPieDataStub').should('have.been.calledThrice');
    cy.get('@setBarDataStub').should('have.been.calledOnce');
  });

  it('should calculate metrics correctly', () => {
    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as InventoryReportComponent;
      
      expect(component.InventoryReport).to.not.be.undefined;
      expect(component.InventoryReport.metrics).to.include({
        metric_1: 'Total Stock Items: 100',
        metric_2: 'Total Requests: 0',
        metric_3: 'Total Stock Quantity Requested: 0',
        metric_4: 'Total Low Stock Items: 0'
      });
    });
  });

  it('should navigate back to reports', () => {
    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as InventoryReportComponent;
      component.back();
    });

    cy.get('@routerNavigateStub').should('have.been.calledWith', ['/reports']);
  });

  // Add more tests as needed...
});