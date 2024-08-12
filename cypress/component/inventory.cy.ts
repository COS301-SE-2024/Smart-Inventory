// import { InventoryComponent } from '../../src/app/pages/inventory/inventory.component';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ActivatedRoute } from '@angular/router';
// import { of } from 'rxjs';

// declare global {
//     interface Window {
//         fetchAuthSession: any;
//         LambdaClient: any;
//         CognitoIdentityProviderClient: any;
//     }
// }

// describe('InventoryComponent', () => {
//     beforeEach(() => {
//         // Mock the AWS SDK and related functions
//         cy.window().then((win) => {
//             win.fetchAuthSession = cy.stub().resolves({
//                 credentials: {},
//                 tokens: { accessToken: { toString: () => 'mock-access-token' } },
//             });

//             win.LambdaClient = class {
//                 send = cy.stub().resolves({
//                     Payload: new TextEncoder().encode(
//                         JSON.stringify({
//                             statusCode: 200,
//                             body: JSON.stringify([
//                                 {
//                                     inventoryID: '1',
//                                     SKU: 'ITEM1',
//                                     category: 'Category1',
//                                     productID: 'PROD1',
//                                     description: 'Test Item 1',
//                                     quantity: 10,
//                                     supplier: 'Supplier1',
//                                     expirationDate: '2023-12-31',
//                                     lowStockThreshold: 5,
//                                     reorderFreq: 30,
//                                 },
//                                 {
//                                     inventoryID: '2',
//                                     SKU: 'ITEM2',
//                                     category: 'Category2',
//                                     productID: 'PROD2',
//                                     description: 'Test Item 2',
//                                     quantity: 20,
//                                     supplier: 'Supplier2',
//                                     expirationDate: '2024-06-30',
//                                     lowStockThreshold: 10,
//                                     reorderFreq: 60,
//                                 },
//                             ]),
//                         }),
//                     ),
//                 });
//             };

//             win.CognitoIdentityProviderClient = class {
//                 send = cy.stub().resolves({
//                     UserAttributes: [{ Name: 'custom:tenentId', Value: 'mock-tenant-id' }],
//                 });
//             };
//         });

//         cy.mount(InventoryComponent, {
//             imports: [MatDialogModule, MatSnackBarModule, BrowserAnimationsModule],
//         });
//     });

//     it('should load and display inventory data', () => {
//         cy.get('ag-grid-angular').should('exist');
//         cy.get('.ag-row').should('have.length', 2);
//         cy.contains('ITEM1').should('be.visible');
//         cy.contains('ITEM2').should('be.visible');
//     });

//     it('should open add item popup when Add New Item button is clicked', () => {
//         cy.contains('Add New Item').click();
//         cy.get('.popup-content').should('be.visible');
//         cy.contains('Add Inventory Item').should('be.visible');
//     });

//     it('should close add item popup when Cancel button is clicked', () => {
//         cy.contains('Add New Item').click();
//         cy.get('.popup-content').should('be.visible');
//         cy.contains('Cancel').click();
//         cy.get('.popup-content').should('not.exist');
//     });

//     it('should add a new item when form is submitted', () => {
//         cy.contains('Add New Item').click();

//         cy.get('input[placeholder="Product ID"]').type('PROD3');
//         cy.get('input[placeholder="SKU"]').type('ITEM3');
//         cy.get('input[placeholder="Description"]').type('Test Item 3');
//         cy.get('input[placeholder="Category"]').type('Category3');
//         cy.get('input[placeholder="Quantity"]').type('30');
//         cy.get('select[placeholder="Supplier"]').select('Supplier1');
//         cy.get('input[placeholder="Expiration Date"]').type('2025-12-31');
//         cy.get('input[placeholder="Low Stock Threshold"]').type('15');
//         cy.get('input[placeholder="Reorder Frequency"]').type('90');

//         cy.contains('Submit').click();

//         cy.get('.ag-row').should('have.length', 3);
//         cy.contains('ITEM3').should('be.visible');
//     });

//     it('should open delete confirmation dialog when delete is attempted', () => {
//         cy.get('.ag-row').first().find('.ag-selection-checkbox').click();
//         cy.get('button[aria-label="Delete"]').click();
//         cy.contains('Are you sure you want to delete this inventory item?').should('be.visible');
//     });

//     it('should delete an item when confirmed', () => {
//         cy.get('.ag-row').first().find('.ag-selection-checkbox').click();
//         cy.get('button[aria-label="Delete"]').click();
//         cy.contains('Yes').click();
//         cy.get('.ag-row').should('have.length', 1);
//     });

//     it('should update an item when cell value is changed', () => {
//         cy.get('.ag-row').first().find('.ag-cell[col-id="quantity"]').dblclick();
//         cy.get('.ag-cell-edit-input').clear().type('15{enter}');
//         cy.get('.ag-row').first().find('.ag-cell[col-id="quantity"]').should('contain', '15');
//     });

//     it('should open request stock popup when request stock is clicked', () => {
//         cy.get('.ag-row').first().find('button').contains('Request Stock').click();
//         cy.get('.popup-content').should('be.visible');
//         cy.contains('Request Stock').should('be.visible');
//     });

//     it('should request stock when form is submitted', () => {
//         cy.get('.ag-row').first().find('button').contains('Request Stock').click();
//         cy.get('input[placeholder="Quantity"]').type('5');
//         cy.contains('Request').click();
//         cy.get('.ag-row').first().find('.ag-cell[col-id="quantity"]').should('contain', '5');
//     });
// });

// import { InventoryComponent } from '../../src/app/pages/inventory/inventory.component';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ActivatedRoute } from '@angular/router';
// import { TitleService } from '../../src/app/components/header/title.service';

// declare global {
//     interface Window {
//         fetchAuthSession: any;
//         LambdaClient: any;
//         CognitoIdentityProviderClient: any;
//     }
// }

import { InventoryComponent } from '../../src/app/pages/inventory/inventory.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { TitleService } from '../../src/app/components/header/title.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('InventoryComponent', () => {
  beforeEach(() => {
    // Intercept and mock Cognito Identity requests
    cy.intercept('POST', 'https://cognito-identity.us-east-1.amazonaws.com/', {
      statusCode: 200,
      body: {
        IdentityId: 'mock-identity-id',
        Credentials: {
          AccessKeyId: 'mock-access-key-id',
          SecretKey: 'mock-secret-key',
          SessionToken: 'mock-session-token',
        },
      },
    }).as('cognitoIdentity');

    // Intercept and mock Cognito IDP requests
    cy.intercept('POST', 'https://cognito-idp.us-east-1.amazonaws.com/', {
      statusCode: 200,
      body: {
        AuthenticationResult: {
          AccessToken: 'mock-access-token',
          IdToken: 'mock-id-token',
          RefreshToken: 'mock-refresh-token',
        },
        UserAttributes: [
          { Name: 'custom:tenentId', Value: 'mock-tenant-id' },
          { Name: 'given_name', Value: 'Test' },
          { Name: 'family_name', Value: 'User' },
        ],
      },
    }).as('cognitoAuth');

    // Intercept and mock Lambda requests
    cy.intercept('POST', 'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/Inventory-getItems/invocations', {
      statusCode: 200,
      body: {
        statusCode: 200,
        body: JSON.stringify([
          {
            inventoryID: 'b6613562-429a-4cb4-b1c8-bd5b19c07880',
            SKU: '12345',
            category: 'Food: Perishable',
            upc: '12345',
            description: 'Cornflakes',
            quantity: 49,
            supplier: 'Makro',
            expirationDate: '2026-08-10T22:00:00.000Z',
            lowStockThreshold: 20,
            reorderAmount: 30,
          },
        ]),
      },
    }).as('getInventoryItems');

    cy.intercept('POST', 'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/getSuppliers/invocations', {
      statusCode: 200,
      body: {
        statusCode: 200,
        body: JSON.stringify([
          { id: '1', name: 'Makro' },
          { id: '2', name: 'Supplier2' },
        ]),
      },
    }).as('getSuppliers');

    cy.intercept('POST', 'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/getUsers/invocations', {
      statusCode: 200,
      body: {
        statusCode: 200,
        body: JSON.stringify([
          {
            Username: 'testuser',
            Attributes: [
              { Name: 'email', Value: 'testuser@example.com' },
              { Name: 'custom:role', Value: 'admin' },
            ],
            Groups: [{ GroupName: 'admin' }],
          },
        ]),
      },
    }).as('getUsers');

    cy.intercept('POST', 'https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/userActivity-createItem/invocations', {
      statusCode: 200,
      body: {
        statusCode: 201,
        body: JSON.stringify({ message: 'Activity logged successfully' }),
      },
    }).as('logUserActivity');

    cy.stub(TitleService.prototype, 'updateTitle').as('updateTitleStub');

    cy.on('uncaught:exception', (err, runnable) => {
      console.log('Uncaught exception:', err.message);
      return false;
    });

    cy.mount(InventoryComponent, {
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: { subscribe: cy.stub() },
            queryParams: { subscribe: cy.stub() },
            snapshot: {
              paramMap: {
                get: cy.stub().returns(null),
              },
            },
          },
        },
        TitleService,
      ],
    }).as('component');
  });

  it('should load and display inventory data', () => {
    cy.get('@updateTitleStub').should('have.been.calledWith', 'Inventory');
    
    cy.wait(['@cognitoIdentity', '@cognitoAuth', '@getInventoryItems', '@getSuppliers', '@getUsers', '@logUserActivity']);

    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as InventoryComponent;
      cy.log('Component state:', JSON.stringify({
        isLoading: component.isLoading,
        rowData: component.rowData,
      }));
    });

    // Remove loading overlay if present
    cy.get('body').then($body => {
      if ($body.find('.loading-overlay').length > 0) {
        cy.log('Loading overlay found. Removing...');
        cy.get('.loading-overlay').invoke('remove');
      }
    });

    // Force a refresh of the component and grid
    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as InventoryComponent;
      component.ngOnInit();
      component.isLoading = false;
      if (component.gridComponent && component.gridComponent.api) {
        cy.log('Forcing grid refresh...');
        component.gridComponent.api.refreshCells({ force: true });
        component.gridComponent.api.sizeColumnsToFit();
      } else {
        cy.log('Grid API not available');
      }
      cy.wait(2000);
    });

    // Set grid height and check dimensions
    cy.get('ag-grid-angular', { timeout: 20000 }).should('exist').then(($grid) => {
      $grid.css('height', '400px');
      cy.wait(1000); // Wait for potential re-render
      const width = $grid.width();
      const height = $grid.height();
      cy.log(`Grid dimensions: ${width}x${height}`);
    });

    // Log grid internal structure
    cy.get('ag-grid-angular').then(($grid) => {
      cy.log('Grid internal structure:');
      cy.log($grid.html());
    });

    // Check for grid content with increased timeout
    cy.get('.ag-root-wrapper', { timeout: 30000 }).should('exist').then(($wrapper) => {
      cy.log('ag-root-wrapper found');
      cy.wrap($wrapper).should('be.visible');
    });

    cy.get('.ag-center-cols-container', { timeout: 30000 }).should('exist').then(($container) => {
      cy.log('ag-center-cols-container found');
      cy.wrap($container).should('be.visible');
    });

    // Check for specific cell content
    cy.get('.ag-cell-value', { timeout: 30000 }).contains('12345').should('exist');
    cy.get('.ag-cell-value', { timeout: 30000 }).contains('Cornflakes').should('exist');
    cy.get('.ag-cell-value', { timeout: 30000 }).contains('49').should('exist');

    // Log grid-related CSS
    cy.get('ag-grid-angular').then(($grid) => {
      const styles = window.getComputedStyle($grid[0]);
      cy.log('Grid CSS:', JSON.stringify({
        display: styles.display,
        height: styles.height,
        width: styles.width,
        position: styles.position,
        overflow: styles.overflow,
      }));
    });

    // If still not visible, log the entire body content
    cy.get('body').then(($body) => {
      if ($body.find('.ag-cell-value:visible').length === 0) {
        cy.log('Body content:', $body.html());
      }
    });
  });
});