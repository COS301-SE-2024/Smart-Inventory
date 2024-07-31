import { GridComponent } from '../../src/app/components/grid/grid.component';
import { TestBed } from '@angular/core/testing';
import { AgGridModule } from 'ag-grid-angular';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('GridComponent has all its components', () => {
    const columnDefs = [
        { field: 'make', headerName: 'Make' },
        { field: 'model', headerName: 'Model' },
        { field: 'price', headerName: 'Price' },
    ];

    const rowData = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                GridComponent, // Import the standalone component
                BrowserModule,
                NoopAnimationsModule,
                AgGridModule,
                RouterModule.forRoot([]),
            ],
        }).compileComponents();
    });

    it('mounts', () => {
        cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include("Cannot read properties of undefined (reading 'path')");
            // Returning false here prevents Cypress from failing the test
            return false;
        });

        cy.mount(GridComponent);
    });

    it('Search Bar visible', () => {
        cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include("Cannot read properties of undefined (reading 'path')");
            // Returning false here prevents Cypress from failing the test
            return false;
        });

        cy.mount(GridComponent);

        cy.get('input').should('be.visible').should('have.attr', 'placeholder', 'Search...');
    });

    it('Select Bar visible', () => {
        cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include("Cannot read properties of undefined (reading 'path')");
            // Returning false here prevents Cypress from failing the test
            return false;
        });

        cy.mount(GridComponent);

        cy.get('.mat-mdc-select').should('be.visible').should('have.attr', 'placeholder', 'Select Column');
    });

    it('Quick Actions visible', () => {
        cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include("Cannot read properties of undefined (reading 'path')");
            // Returning false here prevents Cypress from failing the test
            return false;
        });

        cy.mount(GridComponent);

        cy.get('.btn-holder > :nth-child(2)').should('be.visible').contains('Quick Actions');
    });
});
describe('Grid Component allows to add own columns and data', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                GridComponent,
                BrowserAnimationsModule,
                AgGridModule,
                MatDialogModule,
                MatSelectModule,
                MatFormFieldModule,
                MatInputModule,
                FormsModule,
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => '1',
                            },
                            url: [{ path: 'test' }],
                        },
                    },
                },
            ],
        }).compileComponents();
        const columnDefs = [
            { field: 'make', headerName: 'Make' },
            { field: 'model', headerName: 'Model' },
            { field: 'price', headerName: 'Price' },
        ];

        const rowData = [
            { make: 'Toyota', model: 'Celica', price: 35000 },
            { make: 'Ford', model: 'Mondeo', price: 32000 },
            { make: 'Porsche', model: 'Boxster', price: 72000 },
        ];

        cy.mount(GridComponent, {
            componentProperties: {
                columnDefs,
                rowData,
                addButton: { text: 'Add Car' },
            },
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => '1',
                            },
                            url: [{ path: 'test' }],
                        },
                    },
                },
            ],
        });
    });

    it('should display the grid with correct columns and data', () => {
        cy.get('.ag-header-cell-text').should('have.length', 3);
        cy.get('.ag-header-cell-text').eq(0).should('contain', 'Make');
        cy.get('.ag-header-cell-text').eq(1).should('contain', 'Model');
        cy.get('.ag-header-cell-text').eq(2).should('contain', 'Price');

        cy.get('.ag-center-cols-container .ag-row').should('have.length', 3);
        cy.get('.ag-center-cols-container .ag-row').eq(0).should('contain', 'Toyota');
        cy.get('.ag-center-cols-container .ag-row').eq(1).should('contain', 'Ford');
        cy.get('.ag-center-cols-container .ag-row').eq(2).should('contain', 'Porsche');
    });
});

// describe('GridComponent Editing Functionality', () => {
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [
//                 GridComponent,
//                 BrowserAnimationsModule,
//                 AgGridModule,
//                 MatDialogModule,
//                 MatSelectModule,
//                 MatFormFieldModule,
//                 MatInputModule,
//                 FormsModule,
//             ],
//             providers: [
//                 {
//                     provide: ActivatedRoute,
//                     useValue: {
//                         snapshot: {
//                             paramMap: {
//                                 get: () => 'testId',
//                             },
//                             url: [{ path: 'test' }],
//                         },
//                         paramMap: of(new Map([['id', 'testId']])),
//                     },
//                 },
//             ],
//         }).compileComponents();
//     });

//     it('should allow editing of cell values', () => {
//         const sampleData = [
//             { make: 'Toyota', model: 'Celica', price: 35000 },
//             { make: 'Ford', model: 'Mondeo', price: 32000 },
//             { make: 'Porsche', model: 'Boxster', price: 72000 },
//         ];

//         const columnDefs = [
//             { field: 'make', headerName: 'Make' },
//             { field: 'model', headerName: 'Model' },
//             { field: 'price', headerName: 'Price' },
//         ];

//         cy.mount(GridComponent, {
//             componentProperties: {
//                 rowData: sampleData,
//                 columnDefs: columnDefs,
//                 addButton: { text: 'Add' },
//             },
//         }).as('component');

//         cy.get('.ag-root-wrapper').should('be.visible');

//         // Edit the 'make' of the first row
//         cy.get('.ag-center-cols-container .ag-row')
//             .first()
//             .find('.ag-cell')
//             .first()
//             .dblclick()
//             .type('{selectall}Honda{enter}');

//         // Verify that the cell value has changed
//         cy.get('.ag-center-cols-container .ag-row').first().find('.ag-cell').first().should('contain', 'Honda');

//         // Edit the 'price' of the second row
//         cy.get('.ag-center-cols-container .ag-row')
//             .eq(1)
//             .find('.ag-cell')
//             .eq(2)
//             .dblclick()
//             .type('{selectall}40000{enter}');

//         // Verify that the cell value has changed
//         cy.get('.ag-center-cols-container .ag-row').eq(1).find('.ag-cell').eq(2).should('contain', '40000');

//         // Verify that the itemToUpdate event was emitted with correct data
//         // ... previous test code ...

//         // Verify that the itemToUpdate event was emitted with correct data
//         cy.get('@component').then((wrapper: any) => {
//             const component = (wrapper as any).component;
//             cy.wrap(component.itemToUpdate).as('itemToUpdate');
//         });

//         cy.get('@itemToUpdate').should(
//             'have.been.calledWith',
//             Cypress.sinon.match({
//                 data: Cypress.sinon.match({ make: 'Honda' }),
//                 field: 'make',
//                 newValue: 'Honda',
//             }),
//         );

//         cy.get('@itemToUpdate').should(
//             'have.been.calledWith',
//             Cypress.sinon.match({
//                 data: Cypress.sinon.match({ price: 40000 }),
//                 field: 'price',
//                 newValue: 40000,
//             }),
//         );
//     });
// });
describe('GridComponent Editing Functionality', () => {
    let component: GridComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                GridComponent,
                BrowserAnimationsModule,
                AgGridModule,
                MatDialogModule,
                MatSelectModule,
                MatFormFieldModule,
                MatInputModule,
                FormsModule,
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => 'testId',
                            },
                            url: [{ path: 'test' }],
                        },
                        paramMap: of(new Map([['id', 'testId']])),
                    },
                },
            ],
        }).compileComponents();
    });

    it('should allow editing of cell values', () => {
        const sampleData = [
            { make: 'Toyota', model: 'Celica', price: 35000 },
            { make: 'Ford', model: 'Mondeo', price: 32000 },
            { make: 'Porsche', model: 'Boxster', price: 72000 },
        ];

        const columnDefs = [
            { field: 'make', headerName: 'Make' },
            { field: 'model', headerName: 'Model' },
            { field: 'price', headerName: 'Price' },
        ];

        cy.mount(GridComponent, {
            componentProperties: {
                rowData: sampleData,
                columnDefs: columnDefs,
                addButton: { text: 'Add' },
            },
        }).then((wrapper) => {
            component = wrapper.component;
            cy.spy(component.itemToUpdate, 'emit').as('itemToUpdateSpy');
        });

        cy.get('.ag-root-wrapper').should('be.visible');

        // Edit the 'make' of the first row
        cy.get('.ag-center-cols-container .ag-row')
            .first()
            .find('.ag-cell')
            .first()
            .dblclick()
            .type('{selectall}Honda{enter}');

        // Verify that the cell value has changed
        cy.get('.ag-center-cols-container .ag-row').first().find('.ag-cell').first().should('contain', 'Honda');

        // Edit the 'price' of the second row
        cy.get('.ag-center-cols-container .ag-row')
            .eq(1)
            .find('.ag-cell')
            .eq(2)
            .dblclick()
            .type('{selectall}40000{enter}');

        // Verify that the cell value has changed
        cy.get('.ag-center-cols-container .ag-row').eq(1).find('.ag-cell').eq(2).should('contain', '40000');

        // Verify that the itemToUpdate event was emitted with correct data
        cy.get('@itemToUpdateSpy').should(
            'have.been.calledWith',
            Cypress.sinon.match({
                data: Cypress.sinon.match({ make: 'Honda' }),
                field: 'make',
                newValue: 'Honda',
            }),
        );

        cy.get('@itemToUpdateSpy').should(
            'have.been.calledWith',
            Cypress.sinon.match({
                data: Cypress.sinon.match({ price: 40000 }),
                field: 'price',
                newValue: 40000,
            }),
        );
    });
});
