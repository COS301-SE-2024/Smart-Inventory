import { CustomQuoteModalComponent } from '../../src/app/components/custom-quote-modal/custom-quote-modal.component';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('CustomQuoteModalComponent', () => {
    beforeEach(() => {
        cy.viewport(1280, 720);
        cy.mount(CustomQuoteModalComponent, {
            imports: [BrowserAnimationsModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: cy.stub().as('dialogClose'),
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { isEditing: false, isNewQuote: true, quoteDetails: null },
                },
                {
                    provide: MatSnackBar,
                    useValue: {
                        open: cy.stub().as('snackBarOpen'),
                    },
                },
            ],
        });
    });

    it('should mount successfully', () => {
        cy.get('body').should('exist');
    });

    it('should display the correct title', () => {
        cy.get('h2').should('contain', 'Create Custom Quote');
    });

    it('should display Quote Items section', () => {
        cy.get('.items-section h3').should('contain', 'Quote Items');
    });

    it('should allow adding new items', () => {
        cy.get('.item-list .item-row').should('have.length', 1);
        cy.get('button').contains('Add Item').click();
        cy.get('.item-list .item-row').should('have.length', 2);
    });

    it('should allow removing items', () => {
        cy.get('.item-list .item-row').should('have.length', 1);
        cy.get('button').contains('Add Item').click();
        cy.get('.item-list .item-row').should('have.length', 2);
        cy.get('.item-row').last().find('.remove-item-button').click();
        cy.get('.item-list .item-row').should('have.length', 1);
    });

    it('should display Suppliers section', () => {
        cy.get('.suppliers-section h3').should('contain', 'Suppliers');
    });

    it('should have Cancel button', () => {
        cy.get('button').contains('Cancel').should('exist');
    });

    it('should have Create Order button for new quotes', () => {
        cy.get('button').contains('Create Order').should('exist');
    });
});

describe('CustomQuoteModalComponent ith mocked API', () => {
    beforeEach(() => {
        cy.viewport(1280, 720);
        // Mock data that would normally come from AWS
        const mockSuppliers = ['Supplier 1', 'Supplier 2'];
        const mockInventoryItems = [
            { sku: 'ITEM1', description: 'Test Item 1' },
            { sku: 'ITEM2', description: 'Test Item 2' },
        ];

        cy.mount(CustomQuoteModalComponent, {
            imports: [BrowserAnimationsModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: cy.stub().as('dialogClose'),
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { isEditing: false, isNewQuote: true, quoteDetails: null },
                },
                {
                    provide: MatSnackBar,
                    useValue: {
                        open: cy.stub().as('snackBarOpen'),
                    },
                },
            ],
        }).then((wrapper) => {
            // Manually set the data that would normally be fetched from AWS
            wrapper.component.suppliers = mockSuppliers;
            wrapper.component.inventoryItems = mockInventoryItems;
            wrapper.component.isLoading = false;
            wrapper.component.addItem(); // Add an initial item
            cy.wrap(wrapper.component).as('component');
        });
    });

    it('should have Create Order button for new quotes', () => {
        cy.get('button').contains('Create Order').should('exist');
    });

    // it('should display supplier dropdown with mocked data', () => {
    //     cy.get('[data-cy=supplierSelect]').click();
    //     cy.get('mat-option').should('have.length', 2);
    //     cy.get('mat-option').contains('Supplier 1').should('exist');
    //     cy.get('mat-option').contains('Supplier 2').should('exist');
    // });

    // it('should display item dropdown with mocked data', () => {
    //     cy.get('mat-select[formControlName="item"]').first().click();
    //     cy.get('mat-option').should('have.length', 2);
    //     cy.get('mat-option').contains('ITEM1 - Test Item 1').should('exist');
    //     cy.get('mat-option').contains('ITEM2 - Test Item 2').should('exist');
    // });

    it('should add a new item when Add Item button is clicked', () => {
        cy.get('.item-row').should('have.length', 1);
        cy.get('button').contains('Add Item').click();
        cy.get('.item-row').should('have.length', 3);
    });

    it('should remove an item when remove button is clicked', () => {
        cy.get('button').contains('Add Item').click();
        cy.get('.item-row').should('have.length', 3);
        cy.get('.remove-item-button').first().click();
        cy.get('.item-row').should('have.length', 2);
    });

    it('should close dialog when cancel button is clicked', () => {
        cy.get('button').contains('Cancel').click();
        cy.get('@dialogClose').should('have.been.calledWith', { action: 'cancel' });
    });

    it('should create order when Create Order button is clicked', () => {
        cy.get('@component').then((component) => {
            component.selectedSuppliers = ['Supplier 1'];
            component.quoteItems[0].item = { sku: 'ITEM1', description: 'Test Item 1' };
            component.quoteItems[0].quantity = 5;
        });
        cy.get('button').contains('Create Order').click();
        cy.get('@dialogClose').should(
            'have.been.calledWith',
            Cypress.sinon.match.hasNested('data.items[0].ItemSKU', 'ITEM1'),
        );
    });
});
