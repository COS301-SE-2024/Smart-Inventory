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
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
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
import { MatCardModule } from '@angular/material/card';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ViewQrcodeModalComponent } from '../view-qrcode-modal/view-qrcode-modal.component';
import { ScanQrcodeModalComponent } from '../scan-qrcode-modal/scan-qrcode-modal.component';

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
        MatCardModule,
    ],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
    encapsulation: ViewEncapsulation.Emulated,
})
export class GridComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() set rowData(value: any[] | null | undefined) {
        if (value) {
            this._rowData = value;
            this.setGridHeight();
            this.refreshGrid(value);
        } else {
            this._rowData = [];
        }
    }
    get rowData(): any[] {
        return this._rowData;
    }
    private _rowData: any[] = [];
    private role: string = '';
    @Input() columnDefs: ColDef[] = [];
    @Input() addButton: { text: string } = { text: 'Add' };
    @Input() context: any;
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
    @Output() viewInventorySummary = new EventEmitter<void>();
    @Output() deleteRowClicked = new EventEmitter<void>();
    @Output() importExcelClicked = new EventEmitter<void>();
    @Output() viewAutomationTemplatesClicked = new EventEmitter<void>();
    @Output() scanQRCode = new EventEmitter<string>();

    @Output() runEoqRopCalculation = new EventEmitter<void>();

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
        private snackBar: MatSnackBar,
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
        this.snackBar.open(message, 'Close', {
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
        if (this.gridApi && newData && newData.length > 0) {
            // Remove all existing rows
            const allRows = this.gridApi.getDisplayedRowCount();
            if (allRows > 0) {
                const rowsToRemove = [];
                for (let i = 0; i < allRows; i++) {
                    const row = this.gridApi.getDisplayedRowAtIndex(i);
                    if (row) {
                        rowsToRemove.push(row.data);
                    }
                }
                this.gridApi.applyTransaction({ remove: rowsToRemove });
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
        const baseHeight = 75; // Base height in vh
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
        this.columnDefs = this.columnDefs.map((col) => ({ ...col }));
        this.setGridHeight();
        this.logAuthSession();
    }

    async logAuthSession() {
        try {
            const session = await fetchAuthSession();
            this.role = '' + session.tokens?.idToken?.payload?.['cognito:groups']?.toString();
        } catch (error) {
            console.error('Error fetching auth session:', error);
        }
    }

    isAdmin() {
        return this.role == 'admin';
    }

    isInvCont() {
        return this.role == 'inventorycontroller';
    }

    isEndUser() {
        return this.role == 'enduser';
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

    onViewTemplates() {
        this.viewAutomationTemplatesClicked.emit();
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
        this.importExcelClicked.emit();
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
            width: '600px',
            maxWidth: '600px',
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
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows && selectedRows.length > 0) {
            this.viewReceivedQuotesClicked.emit(selectedRows[0]);
        } else {
            this.oopenSnackBar('Please select an order to view received quotes');
        }
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

    onViewInventorySummary() {
        this.viewInventorySummary.emit();
    }

    onViewQRCode() {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows && selectedRows.length > 0) {
            const selectedItem = selectedRows[0];
            if (selectedItem.qrCode) {
                this.dialog.open(ViewQrcodeModalComponent, {
                    width: '600px',
                    data: {
                        qrCode: selectedItem.qrCode,
                        sku: selectedItem.sku,
                        description: selectedItem.description,
                    },
                });
            } else {
                this.snackBar.open('No QR code available for this item', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            }
        } else {
            this.snackBar.open('Please select an inventory item to view its QR code', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    onScanQRCode() {
        const dialogRef = this.dialog.open(ScanQrcodeModalComponent, {
            width: '90%',
            maxWidth: '600px',
            height: '90%',
            maxHeight: '600px',
        });

        dialogRef.afterClosed().subscribe((result: string | undefined) => {
            if (result) {
                this.scanQRCode.emit(result);
            }
        });
    }
}
