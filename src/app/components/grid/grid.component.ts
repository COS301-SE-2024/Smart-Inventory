import { Component, Input, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { RemoveComponent } from './remove/remove.component';
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
        AddComponent,
        RemoveComponent,
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
    @Input() removeButton: any;

    filteredRowData: any[] = [];

    gridApi: any;
    gridColumnAPI: any;

    filterSelect: string = '';
    inputFilter: string = '';

    selectOptions: any = [];

    public autoSizeStrategy = {
        type: 'fitGridWidth',
    };

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

    openAddDialog() {
        const dialogRef = this.dialog.open(AddComponent, { data: this.columnDefs });

        dialogRef.afterClosed().subscribe((result) => {});
    }

    openRemoveDialog() {
        const selectedItems = this.gridApi.getSelectedRows();
        const dialogRef = this.dialog.open(RemoveComponent, { data: selectedItems });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.removeItems(selectedItems);
            }
        });
    }

    removeItems(items: any[]) {
        items.forEach((item) => {
            const index = this.rowData.findIndex((row: any) => row === item);
            if (index > -1) {
                this.rowData.splice(index, 1);
            }
        });
        this.filteredRowData = [...this.rowData];
        this.gridApi.setRowData(this.filteredRowData);
    }

    importExcel() {}

    downloadCSV() {
        this.gridApi.getDataAsCsv();
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
