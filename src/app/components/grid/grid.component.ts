import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellValueChangedEvent, RowValueChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { RoleSelectCellEditorComponent } from '../../pages/team/role-select-cell-editor.component';

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
        RoleSelectCellEditorComponent,
    ],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
})
export class GridComponent implements OnInit, OnDestroy  {
    @Input() rowData: any[] = [];
    @Input() columnDefs: ColDef[] = [];
    @Input() addButton: { text: string } = { text: 'Add' };
    @Output() rowsToDelete = new EventEmitter<any[]>();
    @Output() addNewClicked = new EventEmitter<void>();
    @Output() itemToUpdate = new EventEmitter<{ data: any; field: string; newValue: any }>();
    @Output() nameCellValueChanged = new EventEmitter<any>();

    @Output() requestStock = new EventEmitter<any>();
    private themeObserver!: MutationObserver;

    public themeClass: string = 'ag-theme-material'; // Default to light theme

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

    constructor(public dialog: MatDialog, private route: ActivatedRoute) {
        this.setupThemeObserver();
    }

    private setupThemeObserver() {
        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.applyCurrentTheme();
                }
            });
        });
        this.themeObserver.observe(document.body, { attributes: true });
    }

    private applyCurrentTheme() {
        const theme = document.body.getAttribute('data-theme') === 'dark' ? 'ag-theme-material-dark' : 'ag-theme-quartz';
        this.themeClass = theme;
        if (this.gridApi) {
            this.gridApi.redrawRows(); // Redraw rows to apply the new CSS class for the theme change
        }
    }

    ngOnInit(): void {
        this.filteredRowData = [...this.rowData];
        this.selectOptions = this.columnDefs.map((f: any) => f.field);

        // Make all columns editable
        this.columnDefs = this.columnDefs.map((col) => ({ ...col, editable: true }));
    }

    ngAfterViewInit() {
        this.applyCurrentTheme();
    }

    getCurrentRoute(v: string) {
        return v === this.route.snapshot.url[0].path.toString();
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        // this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
        this.applyCurrentTheme();
    }

    ngOnDestroy(): void {
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
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
        if (event.colDef.field !== 'given_name' && event.colDef.field !== 'family_name') {
            this.itemToUpdate.emit({
                data: event.data,
                field: event.colDef.field!,
                newValue: event.newValue,
            });
        } else {
            this.nameCellValueChanged.emit(event);
        }
    }

    onRowValueChanged(event: RowValueChangedEvent) {
        const data = event.data;
        console.log(data);
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

    onRequestStock() {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows && selectedRows.length > 0) {
            this.requestStock.emit(selectedRows[0]);
        } else {
            console.log('No row selected for requesting stock');
            // Optionally, you could show an alert or notification to the user
        }
    }
}
