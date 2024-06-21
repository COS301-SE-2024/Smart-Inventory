import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { RoleChangeConfirmationDialogComponent } from './role-change-confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-role-select-cell-editor',
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatButtonModule],
    template: `
        <button mat-button [matMenuTriggerFor]="roleMenu" class="role-button">
            {{ value }}
        </button>
        <mat-menu #roleMenu="matMenu">
            <button mat-menu-item *ngFor="let role of roles" (click)="onRoleChange(role)">
                {{ role }}
            </button>
        </mat-menu>
    `,
    styles: [
        `
            .role-button {
                border-radius: 0;
                width: 100%;
                color: #000;
                font-weight: inherit;
                font-size: inherit;
                text-align: left;
                justify-content: flex-start;
                padding-left: 5px;
            }
        `,
    ],
})
export class RoleSelectCellEditorComponent implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    public value!: string;
    public roles: string[] = ['Admin', 'End User', 'Inventory Controller'];

    constructor(private dialog: MatDialog) {}

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = this.params.value;
    }

    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        this.value = this.params.value;
        return true;
    }

    getValue(): string {
        return this.value;
    }

    onRoleChange(newRole: string): void {
        const dialogRef = this.dialog.open(RoleChangeConfirmationDialogComponent, {
            width: '350px',
            data: {
                given_name: this.params.data.given_name,
                family_name: this.params.data.family_name,
                email: this.params.data.email,
                newRole: newRole,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // User confirmed, update the value
                this.value = newRole;
                this.params.api.stopEditing();
            } else {
                // User cancelled, revert the change
                this.params.api.stopEditing();
            }
        });
    }
}
