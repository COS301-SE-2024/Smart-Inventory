import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { RoleChangeConfirmationDialogComponent } from './role-change-confirmation-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-select-cell-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select (change)="onChange($event)">
      <option *ngFor="let role of roles" [value]="role" [selected]="role === value">
        {{role}}
      </option>
    </select>
  `
})
export class RoleSelectCellEditorComponent implements ICellEditorAngularComp {
  private params!: ICellEditorParams;
  public value!: string;
  public roles: string[] = ['Admin', 'End User', 'Inventory Controller'];

  constructor(private dialog: MatDialog) {}

  agInit(params: ICellEditorParams): void {
    this.params = params;
    this.value = this.params.value;
  }

  getValue(): string {
    return this.value;
  }

  onChange(event: Event): void {
    const newValue = (event.target as HTMLSelectElement).value;
    const dialogRef = this.dialog.open(RoleChangeConfirmationDialogComponent, {
      width: '350px',
      data: { 
        given_name: this.params.data.given_name,
        family_name: this.params.data.family_name,
        email: this.params.data.email,
        newRole: newValue
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User confirmed, update the value
        this.value = newValue;
        this.params.api.stopEditing();
      } else {
        // User cancelled, revert the change
        this.value = this.params.value;
        this.params.api.stopEditing();
      }
    });
  }
}