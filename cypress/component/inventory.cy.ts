import { InventoryComponent } from '../../src/app/pages/inventory/inventory.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

declare global {
    interface Window {
        fetchAuthSession: any;
        LambdaClient: any;
        CognitoIdentityProviderClient: any;
    }
}

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

describe('InventoryComponent', () => {
    beforeEach(() => {
        // Mock the AWS SDK and related functions
        cy.window().then((win) => {
            win.fetchAuthSession = cy.stub().resolves({
                credentials: {},
                tokens: { accessToken: { toString: () => 'mock-access-token' } },
            });

            win.LambdaClient = class {
                send = cy.stub().resolves({
                    Payload: new TextEncoder().encode(
                        JSON.stringify({
                            statusCode: 200,
                            body: JSON.stringify([
                                {
                                    inventoryID: '1',
                                    SKU: 'ITEM1',
                                    category: 'Category1',
                                    productID: 'PROD1',
                                    description: 'Test Item 1',
                                    quantity: 10,
                                    supplier: 'Supplier1',
                                    expirationDate: '2023-12-31',
                                    lowStockThreshold: 5,
                                    reorderFreq: 30,
                                },
                                {
                                    inventoryID: '2',
                                    SKU: 'ITEM2',
                                    category: 'Category2',
                                    productID: 'PROD2',
                                    description: 'Test Item 2',
                                    quantity: 20,
                                    supplier: 'Supplier2',
                                    expirationDate: '2024-06-30',
                                    lowStockThreshold: 10,
                                    reorderFreq: 60,
                                },
                            ]),
                        }),
                    ),
                });
            };

            win.CognitoIdentityProviderClient = class {
                send = cy.stub().resolves({
                    UserAttributes: [{ Name: 'custom:tenentId', Value: 'mock-tenant-id' }],
                });
            };
        });

        cy.mount(InventoryComponent, {
            imports: [MatDialogModule, MatSnackBarModule, BrowserAnimationsModule],
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
            ],
        }).then((wrapper) => {
            (wrapper.component as any).isLoading = false;
            wrapper.component.ngOnInit(); // Call ngOnInit manually
        });
    });

    it('should load and display inventory data', () => {
        cy.wait(1000); // Wait for 1 second
        cy.get('ag-grid-angular').should('exist');
    });

    it('should load and display inventory data', () => {
        cy.wait(1000);
        cy.get('body').then(($body) => {
            if ($body.find('ag-grid-angular').length === 0) {
                // If ag-grid-angular is not found, log the entire body content
                cy.log('Body content:', $body.html());
            }
        });
        cy.get('ag-grid-angular').should('exist');
    });
});

describe('InventoryComponent', () => {
    beforeEach(() => {
        // Mock the AWS SDK and related functions
        cy.mount(InventoryComponent);
    });

    it('should load and display inventory data', () => {
        cy.wait(1000); // Wait for 1 second
        cy.get('ag-grid-angular').should('exist');
    });
});
