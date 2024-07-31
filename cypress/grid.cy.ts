import { GridComponent } from '../src/app/components/grid/grid.component';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../src/app/components/material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
// Import ag-Grid and plugin functions
import { AgGridAngular } from 'ag-grid-angular'; // Adjust path as needed
import { gridContainsText, sortColumn, filterBy } from 'cypress-ag-grid';

describe('SidebarComponent', () => {
    beforeEach(() => {
        cy.mount(GridComponent, {
            imports: [
                MaterialModule,
                CommonModule,
                RouterLink,
                FormsModule,
                MatIconModule,
                BrowserAnimationsModule,
                // Add AgGridAngular for test access
                AgGridAngular,
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: { route: { path: 'dashboard' } },
                    },
                },
            ],
        });
    });

    it('Header should be visible and exists', () => {
        cy.get('.mat-toolbar').should('exist').should('be.visible');
    });

    // Add tests using ag-Grid plugin functions
    it('sorts data by a specific column', () => {
        sortColumn('column-name'); // Replace with actual column name
        // Add assertions to verify sorting using gridContainsText or other methods
    });

    it('filters data based on a condition', () => {
        filterBy('column-name', 'filter-value'); // Replace with actual column and value
        // Add assertions to verify filtering using gridContainsText or other methods
    });
});
