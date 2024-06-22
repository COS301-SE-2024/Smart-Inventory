import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellValueChangedEvent, RowValueChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [
        AgGridAngular,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatMenuModule,
        CommonModule,
        MatSelectModule,
        MatIcon,
    ],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
})
export class GridComponent implements OnInit {
    @Input() rowData: any[] = [];
    @Input() columnDefs: ColDef[] = [];
    @Input() addButton: { text: string } = { text: 'Add' };
    @Output() rowsToDelete = new EventEmitter<any[]>();
    @Output() addNewClicked = new EventEmitter<void>();
    @Output() itemToUpdate = new EventEmitter<{data: any, field: string, newValue: any}>();

    filteredRowData: any[] = [];

    gridApi: any;
    gridColumnApi: any;

    filterSelect: string = '';
    inputFilter: string = '';

    selectOptions: any = [];

    public autoSizeStrategy = {
        type: 'fitGridWidth',
    };

    public rowSelection: 'single' | 'multiple' = 'multiple';
    public editType: 'fullRow' = 'fullRow';

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {
        this.filteredRowData = [...this.rowData];
        this.selectOptions = this.columnDefs.map((f: any) => f.field);
        
        // Make all columns editable
        this.columnDefs = this.columnDefs.map(col => ({...col, editable: true}));
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    addRow() {
        this.addNewClicked.emit();
    }

    deleteRow() {
        var selectedRows = this.gridApi.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            console.log('No rows selected!');
            return;
        }
        this.rowsToDelete.emit(selectedRows);
    }

    onCellValueChanged(event: CellValueChangedEvent) {
        console.log('onCellValueChanged: ' + event.colDef.field + ' = ' + event.newValue);
        this.itemToUpdate.emit({
            data: event.data,
            field: event.colDef.field!,
            newValue: event.newValue
        });
    }

    onRowValueChanged(event: RowValueChangedEvent) {
        const data = event.data;
        console.log(
            'onRowValueChanged: (' + data.make + ', ' + data.model + ', ' + data.price + ', ' + data.field5 + ')',
        );
    }

    importExcel() {
        alert('Import Not completed');
    }

    downloadCSV() {
        const params = {
            fileName: 'orderExport.csv',
        };
        this.gridApi.exportDataAsCsv(params);
    }

    filterGrid() {
        if (this.inputFilter !== '' && this.inputFilter !== null && this.inputFilter !== undefined) {
            let model: any[] = [];
            for (let row of this.rowData) {
                if (row[this.filterSelect].toString().toUpperCase().includes(this.inputFilter.toUpperCase())) {
                    model.push(row);
                }
            }
            this.filteredRowData = model;
        } else {
            this.filteredRowData = [...this.rowData];
        }

        if (this.gridColumnApi !== undefined) {
            this.gridApi.setRowData(this.filteredRowData);
        }
    }

    removeConfirmedRows(rowsToRemove: any[]) {
        this.gridApi.applyTransaction({ remove: rowsToRemove });
    }

    updateRow(updatedRow: any) {
        this.gridApi.applyTransaction({ update: [updatedRow] });
    }
}