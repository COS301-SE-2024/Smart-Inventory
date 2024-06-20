import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';

@Component({
    selector: 'app-delete-button-renderer',
    standalone: true,
    template: `<button class="delete-button" (click)="onDeleteButtonClick()">Delete</button>`,
    styles: [
        `
            .delete-button {
                background-color: #e0e0e0;
                color: #616161;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                line-height: 1.2;
            }

            .delete-button:hover {
                background-color: #bdbdbd; /* Slightly darker grey on hover */
            }

            .delete-button:active {
                background-color: #757575; /* Even darker grey when clicked */
            }
        `,
    ],
})
export class DeleteButtonRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;

    constructor(private dialog: MatDialog) {}

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        return true;
    }

    onDeleteButtonClick() {
        const { given_name, family_name, email } = this.params.data;
        this.openDeleteConfirmationDialog(given_name, family_name, email);
    }

    openDeleteConfirmationDialog(given_name: string, family_name: string, email: string) {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
            width: '300px',
            data: { given_name, family_name, email },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // User confirmed deletion, perform delete logic here
                console.log('Delete confirmed for user:', email);
            }
        });
    }
}
