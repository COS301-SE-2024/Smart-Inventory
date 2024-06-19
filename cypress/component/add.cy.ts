import { AddComponent } from '../../src/app/components/grid/add/add.component';
import { MaterialModule } from '../../src/app/components/material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
describe('AddComponent', () => {
    beforeEach(() => {
        cy.mount(AddComponent, {
            imports: [MaterialModule, CommonModule, FormsModule, MatIconModule, BrowserAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });
    });

    it('Header should be visible and exists', () => {
        cy.get('.header').should('exist').should('be.visible');
    });
});
