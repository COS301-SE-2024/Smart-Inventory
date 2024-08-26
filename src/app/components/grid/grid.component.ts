import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    Output,
    EventEmitter,
    output,
    ChangeDetectorRef,
    ViewChild,
} from '@angular/core';
import { Renderer2, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellValueChangedEvent, RowValueChangedEvent, GridApi } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { RoleSelectCellEditorComponent } from '../../pages/team/role-select-cell-editor.component';
import { DateSelectCellEditorComponent } from '../reports/supplier-report/date-select-cell-editor.component';
import { CustomQuoteModalComponent } from '../custom-quote-modal/custom-quote-modal.component';
import { ReceivedQuotesSidePaneComponent } from '../received-quotes-side-pane/received-quotes-side-pane.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [
        AgGridModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatMenuModule,
        CommonModule,
        MatSelectModule,
        MatIconModule,
        MatDialogModule,
        RoleSelectCellEditorComponent,
        DateSelectCellEditorComponent,
        ReceivedQuotesSidePaneComponent,
        MatTooltip,
        MatAutocompleteModule,
        ReactiveFormsModule,
    ],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
    encapsulation: ViewEncapsulation.Emulated,
})
export class GridComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() set rowData(value: any[]) {
        this._rowData = value;
        this.setGridHeight();
        this.refreshGrid(value);
    }
    get rowData(): any[] {
        return this._rowData;
    }
    private _rowData: any[] = [];
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
    @Output() deleteOrderClicked = new EventEmitter<any>();
    @Output() viewEmailTemplateClicked = new EventEmitter<void>();
    @Output() viewDeliveryInfoClicked = new EventEmitter<void>();
    @Output() viewReceivedQuotesClicked = new EventEmitter<void>();
    @Output() markOrderAsReceivedClicked = new EventEmitter<any>();
    @Output() viewAutomationSettingsClicked = new EventEmitter<void>();

    @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
    gridApi!: GridApi<any>;
    private themeObserver!: MutationObserver;
    gridStyle: any;
    inputFilter = '';
    filteredOptions: string[] = [];

    gridOptions = {
        pagination: true,
        paginationPageSize: 20, // Set the number of rows per page
        // other grid options...
    };
    public themeClass: string = 'ag-theme-material'; // Default to light theme

    filteredRowData: any[] = [];

    // gridApi: any;
    // gridColumnApi: any;

    filterSelect: string = '';

    selectOptions: any = [];

    public autoSizeStrategy = {
        type: 'fitGridWidth',
    };

    selectedRow: any = null;

    public rowSelection: 'single' | 'multiple' = 'multiple';
    public editType: 'fullRow' = 'fullRow';

    constructor(
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private renderer: Renderer2,
        private el: ElementRef,
        private cdr: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
    ) {
        this.setupThemeObserver();
    }

    onFilterTextBoxChanged() {
        this.gridApi.setGridOption(
            'quickFilterText',
            (document.getElementById('filter-text-box') as HTMLInputElement).value,
        );
        this.updateFilteredOptions();
    }

    private updateFilteredOptions() {
        const allValues = this.rowData.flatMap((row) => Object.values(row));
        const uniqueValues = Array.from(new Set(allValues.map(String)));
        this.filteredOptions = uniqueValues.filter((value) =>
            value.toLowerCase().includes(this.inputFilter.toLowerCase()),
        );
    }

    oopenSnackBar(message: string) {
        this._snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
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

    refreshGrid(newData: any[]) {
        if (this.gridApi) {
            // Remove all existing rows
            const allRows = this.gridApi.getModel().getRowCount();
            if (allRows > 0) {
                const rowsToRemove = this.gridApi.getModel().getRow(allRows)!.data;
                this.gridApi.applyTransaction({ remove: [rowsToRemove] });
            }

            // Add new rows
            this.gridApi.applyTransaction({ add: newData });
        }
    }

    private applyCurrentTheme() {
        const theme =
            document.body.getAttribute('data-theme') === 'dark' ? 'ag-theme-material-dark' : 'ag-theme-quartz';
        this.themeClass = theme;
        if (this.gridApi) {
            this.gridApi.redrawRows(); // Redraw rows to apply the new CSS class for the theme change
        }
    }

    setGridHeight(): void {
        const baseHeight = 35; // Base height in vh
        const rowHeight = 3; // Height per row in vh
        const maxHeight = 75; // Maximum height in vh

        let calculatedHeight = baseHeight + this._rowData.length * rowHeight;
        let gridHeight = Math.min(calculatedHeight, maxHeight);

        this.gridStyle = {
            height: `${gridHeight}vh`,
            maxHeight: `${maxHeight}vh`,
        };

        // Force change detection
        this.cdr.detectChanges();

        // Resize the grid if it's already initialized
        if (this.gridApi) {
            setTimeout(() => {
                this.gridApi.sizeColumnsToFit();
                this.gridApi.resetRowHeights();
            });
            this.gridApi.updateGridOptions(this.gridOptions);
        }
    }

    // Example to re-calculate height when data changes
    onRowDataChanged(): void {
        this.setGridHeight();
    }

    ngOnInit(): void {
        this.filteredRowData = [...this.rowData];
        this.selectOptions = this.columnDefs.map((f: any) => f.field);

        // Make all columns editable
        this.columnDefs = this.columnDefs.map((col) => ({ ...col, editable: true }));
        this.setGridHeight();
    }

    ngAfterViewInit() {
        this.applyCurrentTheme();

        const selectPlaceholder = this.el.nativeElement.querySelector('.mat-select-placeholder');
        if (selectPlaceholder) {
            this.renderer.setStyle(selectPlaceholder, 'color', 'var(--text-color)');
        }
        this.cdr.detectChanges();
    }

    getCurrentRoute(v: string) {
        return v === this.route.snapshot.url[0].path.toString();
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.applyCurrentTheme();
        this.setGridHeight();
        console.log('in grid component', this.rowData);
    }

    ngOnDestroy(): void {
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
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
            // console.log();
            this.oopenSnackBar('Please select a row to delete!');
            return;
        }
        this.rowsToDelete.emit(selectedRows);
    }

    deleteOrder() {
        this.deleteOrderClicked.emit();
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
        if (event && event.node && event.node.isSelected()) {
            this.selectedRow = event.data;
            this.rowSelected.emit(this.selectedRow);
        } else {
            this.selectedRow = null;
            this.rowSelected.emit(null);
        }
    }

    onSelectionChanged(event: any) {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows.length > 0) {
            this.selectedRow = selectedRows[0];
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
            fileName: 'Export.csv',
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

        if (this.gridApi) {
            this.refreshGrid(this.filteredRowData);
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
            this.oopenSnackBar('Please select row for requesting stock');
            // console.log('No row selected for requesting stock');
            // Optionally, you could show an alert or notification to the user
        }
    }

    openCustomQuoteModal() {
        const dialogRef = this.dialog.open(CustomQuoteModalComponent, {
            width: '500px',
            data: { isNewQuote: true },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.action === 'createOrder') {
                    console.log('Creating order:', result.data);
                    this.newCustomQuote.emit({ type: 'order', data: result.data });
                }
            }
        });
    }

    onViewEmailTemplate() {
        this.viewEmailTemplateClicked.emit();
    }

    onViewDeliveryInfo() {
        this.viewDeliveryInfoClicked.emit();
    }

    onViewReceivedQuotes() {
        this.viewReceivedQuotesClicked.emit();
    }

    onMarkOrderAsReceived() {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows && selectedRows.length > 0) {
            this.markOrderAsReceivedClicked.emit(selectedRows[0]);
        } else {
            this.oopenSnackBar('No row selected for marking as received');
            // console.log('No row selected for marking as received');
        }
    }

    openAutomationSettings() {
        this.viewAutomationSettingsClicked.emit();
    }
}
