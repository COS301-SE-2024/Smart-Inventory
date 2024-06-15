import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { CellValueChangedEvent, RowValueChangedEvent } from 'ag-grid-community';

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
        AddComponent,
        MatMenuModule,
        CommonModule,
        MatSelectModule,
        MatIcon,
    ],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
})
export class GridComponent implements OnInit {
    @Input() rowData: any;
    @Input() columnDefs: any;
    @Input() addButton: any;

    filteredRowData: any[] = [];

    gridApi: any;
    gridColumnAPI: any;

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
        this.filteredRowData = this.rowData;
        this.selectOptions = this.columnDefs.map((f: any) => f.field);
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnAPI = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    addRow() {
        this.gridApi.applyTransaction({ add: [{}] });
    }

    deleteRow() {
        // get the first child of the
        var selectedRows = this.gridApi.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            console.log('No rows selected!');
            return;
        }
        this.gridApi.applyTransaction({ remove: selectedRows });
    }

    onCellValueChanged(event: CellValueChangedEvent) {
        console.log('onCellValueChanged: ' + event.colDef.field + ' = ' + event.newValue);
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
            this.filteredRowData = this.rowData;
        }

        if (this.gridColumnAPI !== undefined) {
            this.gridApi.setData(this.filteredRowData);
            this.gridColumnAPI.setColumnDefs(this.filteredRowData);
        }
    }
}
