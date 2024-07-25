import { Component } from '@angular/core';
import { ICellEditorAngularComp, ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-date-select-cell-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <select [(ngModel)]="selectedDate" (change)="onDateChange()" class="date-select">
      <option *ngFor="let date of availableDates" [ngValue]="date">{{ date }}</option>
    </select>
    `,
    styles: [`
      .date-select {
        width: 100%;
        border: none;
        background-color: transparent;
        padding: 5px;
        height: 30px;
      }
    `]
})
export class DateSelectCellEditorComponent implements ICellRendererAngularComp, ICellEditorAngularComp {
    private params!: ICellRendererParams | ICellEditorParams;
    public selectedDate!: string;
    public availableDates: string[] = [];

    agInit(params: ICellRendererParams | ICellEditorParams): void {
      this.params = params;
      this.selectedDate = 'Date' in params.data ? params.data.Date : '';
      this.availableDates = params.context.componentParent.getAvailableDates(params.data['Supplier ID']);
    }

    getValue(): string {
      return this.selectedDate;
    }

    onDateChange(): void {
      const newData = this.params.context.componentParent.fetchDataForDate(this.params.data['Supplier ID'], this.selectedDate);
      if ('node' in this.params) {
        this.params.node.setData(newData);
        this.params.api.refreshCells({ rowNodes: [this.params.node], force: true });
      }
    }

    refresh(params: ICellRendererParams | ICellEditorParams): boolean {
      return false; // Return false to indicate that the component does not need to be rerendered
    }
}
