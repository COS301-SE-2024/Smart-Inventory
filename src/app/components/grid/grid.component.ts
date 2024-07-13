import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellValueChangedEvent, RowValueChangedEvent, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
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
import { CustomQuoteModalComponent } from '../quote/custom-quote-modal/custom-quote-modal.component';
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
export class GridComponent implements OnInit {
    @Input() rowData: any[] = [];
    @Input() columnDefs: ColDef[] = [];
    @Input() addButton: { text: string } = { text: 'Add' };
    @Output() rowsToDelete = new EventEmitter<any[]>();
    @Output() addNewClicked = new EventEmitter<void>();
    @Output() itemToUpdate = new EventEmitter<{ data: any; field: string; newValue: any }>();
    @Output() nameCellValueChanged = new EventEmitter<any>();

    @Output() requestStock = new EventEmitter<any>();
    @Output() newCustomQuote = new EventEmitter<any>();
    @Output() viewGeneratedQuoteClicked = new EventEmitter<void>();
    @Output() rowSelected = new EventEmitter<any>();


    filteredRowData: any[] = [];

    gridApi: any;
    // gridColumnApi: any;

    filterSelect: string = '';
    inputFilter: string = '';

    selectOptions: any = [];

    public autoSizeStrategy = {
        type: 'fitGridWidth',
    };

    selectedRow: any = null;

    public rowSelection: 'single' | 'multiple' = 'multiple';
    public editType: 'fullRow' = 'fullRow';

    constructor(public dialog: MatDialog, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.filteredRowData = [...this.rowData];
        this.selectOptions = this.columnDefs.map((f: any) => f.field);

        // Make all columns editable
        this.columnDefs = this.columnDefs.map((col) => ({ ...col, editable: true }));
    }

    getCurrentRoute(v: string) {
        return v === this.route.snapshot.url[0].path.toString();
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    onViewGeneratedQuoteClick() {
        this.viewGeneratedQuoteClicked.emit();
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

    onRowSelected(event: any) {
        if (event.node.isSelected()) {
            this.selectedRow = event.data;
            this.rowSelected.emit(this.selectedRow);
        } else {
            this.selectedRow = null;
            this.rowSelected.emit(null);
        }
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

        if (this.gridApi !== undefined) {
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

    openCustomQuoteModal() {
        const dialogRef = this.dialog.open(CustomQuoteModalComponent, {
            width: '500px',
            data: { isNewQuote: true } // Set isNewQuote to true for creating a new order
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.action === 'saveDraft') {
                    console.log('Saving draft:', result.data);
                    this.newCustomQuote.emit({ type: 'draft', data: result.data });
                } else if (result.action === 'createQuote') {
                    console.log('Creating quote:', result.data);
                    this.newCustomQuote.emit({ type: 'quote', data: result.data });
                }
            }
        });
    }
}
