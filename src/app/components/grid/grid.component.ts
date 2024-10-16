import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { Renderer2, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ForecastModalComponent } from '../forecast-modal/forecast-modal.component';
import {
    ColDef,
    GridReadyEvent,
    CellValueChangedEvent,
    RowValueChangedEvent,
    GridApi,
    CellContextMenuEvent,
} from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import outputs from '../../../../amplify_outputs.json';
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
import { ContextMenuComponent } from './context-menu/context-menu.component';

interface MenuItem {
    title: string;
    action: string;
    icon?: string;
    disabled?: boolean;
}

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
        ForecastModalComponent,
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
    tenentId: string = '';
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
    private recentSearches: string[] = [];
    private maxRecentSearches: number = 5;

    gridOptions = {
        pagination: true,
        paginationPageSize: 20,
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

    @ViewChild('contextMenuContainer', { read: ViewContainerRef, static: true })
    container!: ViewContainerRef;

    onCellContextMenu = (event: CellContextMenuEvent) => {
        this.container.clear();
        const componentRef = this.container.createComponent(ContextMenuComponent);
        const instance = componentRef.instance;

        // Clear existing selection
        this.gridApi.deselectAll();

        // Select the row that was right-clicked
        const node = event.node;
        if (node) {
            node.setSelected(true);

            // Trigger selection changed logic
            this.onSelectionChanged(null);
        }

        // Check if event.event exists and is of type MouseEvent
        if (event.event && event.event instanceof MouseEvent) {
            instance.x = event.event.clientX;
            instance.y = event.event.clientY;
        } else {
            // Fallback to default values if event.event is not a MouseEvent
            instance.x = 0;
            instance.y = 0;
        }

        instance.gridApi = this.gridApi;
        instance.menuItems = this.getContextMenuItems(event);

        instance.menuItemClicked.subscribe((action: string) => {
            this.handleContextMenuAction(action, event);
        });

        event.event?.preventDefault();
    };

    private getContextMenuItems(event: CellContextMenuEvent): MenuItem[] {
        const items: MenuItem[] = [];
        const currentRoute = this.route.snapshot.url[0].path;

        if (!this.isEndUser()) {
            if (currentRoute === 'inventoryReport') {
                items.push({ title: 'Forecast Item', action: 'forecastItem', icon: 'query_stats' });
            }

            if (currentRoute === 'inventory') {
                items.push({ title: 'Add Item', action: 'addItem', icon: 'add' });
                items.push({ title: 'Remove Item', action: 'removeItem', icon: 'remove' });
                items.push({ title: 'Edit', action: 'edit', icon: 'edit' });
                items.push({ title: 'View QR Code', action: 'viewQRCode', icon: 'qr_code_2' });
            }

            if (currentRoute === 'team' && this.isAdmin()) {
                items.push({ title: 'Add Member', action: 'addMember', icon: 'add' });
                items.push({ title: 'Remove Member', action: 'removeMember', icon: 'remove' });
                items.push({ title: 'Edit', action: 'edit', icon: 'edit' });
            }

            if (currentRoute === 'suppliers') {
                items.push({ title: 'Add Supplier', action: 'addSupplier', icon: 'add' });
                items.push({ title: 'Remove Supplier', action: 'removeSupplier', icon: 'remove' });
                items.push({ title: 'Edit', action: 'edit', icon: 'edit' });
            }

            if (currentRoute === 'orders') {
                items.push({ title: 'Create Order', action: 'createOrder', icon: 'add' });
                items.push({ title: 'Delete Order', action: 'deleteOrder', icon: 'remove' });
                items.push({ title: 'Generated Quote', action: 'generatedQuote', icon: 'file_open' });
                items.push({ title: 'Received Quotes', action: 'receivedQuotes', icon: 'inbox' });
                items.push({ title: 'Mark As Received', action: 'markAsReceived', icon: 'done' });
            }
        }
        if (currentRoute === 'inventory') {
            items.push({ title: 'Request Stock', action: 'requestStock', icon: 'sell' });
        }
        return items;
    }

    private handleContextMenuAction(action: string, event: CellContextMenuEvent) {
        switch (action) {
            case 'edit':
                this.gridApi.startEditingCell({
                    rowIndex: event.node!.rowIndex!,
                    colKey: event.column!.getColId(),
                });
                break;
            case 'delete':
            case 'removeItem':
            case 'removeMember':
            case 'removeSupplier':
                this.deleteRow();
                break;
            case 'copy':
                this.gridApi.copySelectedRangeToClipboard({});
                break;
            case 'exportExcel':
                this.downloadCSV();
                break;
            case 'importExcel':
                this.importExcel();
                break;
            case 'forecastItem':
                this.onViewForecast();
                break;
            case 'addItem':
            case 'addMember':
            case 'addSupplier':
                this.addRow();
                break;
            case 'viewQRCode':
                this.onViewQRCode();
                break;
            case 'scanQRCode':
                this.onScanQRCode();
                break;
            case 'requestStock':
                this.onRequestStock();
                break;
            case 'createOrder':
                this.openCustomQuoteModal();
                break;
            case 'deleteOrder':
                this.deleteOrder();
                break;
            case 'generatedQuote':
                this.onViewGeneratedQuoteClick();
                break;
            case 'receivedQuotes':
                this.onViewReceivedQuotes();
                break;
            case 'markAsReceived':
                this.onMarkOrderAsReceived();
                break;
            case 'scanInventory':
                this.openAutomationSettings();
                break;
            case 'automationTemplates':
                this.onViewTemplates();
                break;
            case 'viewInventorySummary':
                this.onViewInventorySummary();
                break;
            case 'runEoqRopCalculation':
                this.runEoqRopCalculation.emit();
                break;
        }
    }

    async getUserInfo() {
        try {
            const session = await fetchAuthSession();

            const cognitoClient = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await cognitoClient.send(getUserCommand);

            this.tenentId =
                getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value || '';
            return this.tenentId;
        } catch (error) {
            console.error('Error fetching user info:', error);
            // You might want to add some error handling here, such as showing an error message to the user
            this.snackBar.open('Error fetching user info', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return null;
        }
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

        const filteredValues = uniqueValues.filter((value) =>
            value.toLowerCase().includes(this.inputFilter.toLowerCase()),
        );

        // Prioritize recent searches
        const recentMatches = this.recentSearches.filter((search) =>
            search.toLowerCase().includes(this.inputFilter.toLowerCase()),
        );

        // Combine recent matches with other filtered values, remove duplicates
        const combinedResults = [...new Set([...recentMatches, ...filteredValues])];

        this.filteredOptions = combinedResults
            .sort((a, b) => {
                // Prioritize exact matches
                if (a.toLowerCase() === this.inputFilter.toLowerCase()) return -1;
                if (b.toLowerCase() === this.inputFilter.toLowerCase()) return 1;

                // Then recent searches
                const aIndex = this.recentSearches.indexOf(a);
                const bIndex = this.recentSearches.indexOf(b);
                if (aIndex !== -1 && bIndex === -1) return -1;
                if (bIndex !== -1 && aIndex === -1) return 1;
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

                // Then by length
                return a.length - b.length;
            })
            .slice(0, 10); // Limit to 10 suggestions
    }

    onOptionSelected(event: any) {
        this.inputFilter = event.option.value;
        this.addToRecentSearches(this.inputFilter);
        this.onFilterTextBoxChanged();
    }

    private addToRecentSearches(search: string) {
        // Remove the search term if it already exists
        this.recentSearches = this.recentSearches.filter((item) => item !== search);

        // Add the new search term to the beginning of the array
        this.recentSearches.unshift(search);

        // Keep only the most recent searches
        this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
    }

    clearSearch() {
        this.inputFilter = '';
        this.filteredOptions = [];
        this.gridApi.setGridOption(
            'quickFilterText',
            ((document.getElementById('filter-text-box') as HTMLInputElement).value = ''),
        );
        this.updateFilteredOptions();
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

    async onViewForecast() {
        const selectedRows = this.gridApi.getSelectedRows();
        if (selectedRows && selectedRows.length > 0) {
            const selectedItem = selectedRows[0];
            try {
                const tenentId = await this.getUserInfo(); // Make sure this method returns a Promise<string>
                if (tenentId) {
                    const dialogRef = this.dialog.open(ForecastModalComponent, {
                        width: '80%',
                        maxWidth: '800px',
                        data: {
                            tenentId: tenentId,
                            SKU: selectedItem.sku,
                        },
                    });

                    dialogRef.afterClosed().subscribe((result) => {
                        if (result && result.error) {
                            this.snackBar.open(`Error: ${result.error}`, 'Close', {
                                duration: 5000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                            });
                        }
                    });
                } else {
                    throw new Error('Unable to fetch tenant ID');
                }
            } catch (error) {
                console.error('Error opening forecast modal:', error);
                this.snackBar.open('Error opening forecast modal. Please try again.', 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            }
        } else {
            this.snackBar.open('Please select an inventory item to view its forecast', 'Close', {
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
