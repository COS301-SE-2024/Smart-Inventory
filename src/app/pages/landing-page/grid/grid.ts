import { Component, OnInit, OnDestroy } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [AgGridModule],
    template: `
    <ag-grid-angular
      style="width: 100%; height: 400px;"
      class="ag-theme-alpine-dark"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [pagination]="true"
      [paginationPageSize]="10"
      [rowHeight]="60"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  `,
    styles: [`
    ::ng-deep .ag-theme-alpine-dark {
        --ag-background-color: #ffffff;
      --ag-header-background-color: #f0f8ff;
      --ag-odd-row-background-color: #f8fbff;
      --ag-header-foreground-color: #2c3e50;
      --ag-foreground-color: #34495e;
      --ag-border-color: #bdc3c7;
      --ag-row-hover-color: #e6f2ff;
      --ag-material-accent-color: #3498db;
      --ag-font-size: 14px;
      --ag-font-family: 'Roboto', sans-serif;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-header-cell {
      font-weight: bold;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-cell {
      display: flex;
      align-items: center;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-cell-wrapper {
      width: 100%;
    }
    ::ng-deep .status-active {
      color: #2ecc71;
    }
    ::ng-deep .status-out-of-stock {
      color: #e74c3c;
    }
    ::ng-deep .status-on-hold {
      color: #f39c12;
    }
  `]
})
export class GridComponent implements OnInit, OnDestroy {
    private gridApi!: GridApi;

    columnDefs: ColDef[] = [
        {
            field: 'albumName',
            headerName: 'Album Name',
            cellRenderer: this.albumRenderer
        },
        { field: 'artist', headerName: 'Artist' },
        { field: 'year', headerName: 'Year' },
        {
            field: 'status',
            headerName: 'Status',
            cellRenderer: this.statusRenderer
        },
        { field: 'inventory', headerName: 'Inventory' },
        { field: 'incoming', headerName: 'Incoming' },
        { field: 'price', headerName: 'Price' },
        { field: 'sold', headerName: 'Sold' },
        { field: 'estProfit', headerName: 'Est. Profit' },
        {
            headerName: 'Actions',
            cellRenderer: () => 'Hold Selling',
            cellClass: 'action-button'
        }
    ];

    defaultColDef: ColDef = {
        sortable: true,
        filter: true
    };

    rowData: any[] = [];
    private updateSubscription: Subscription | undefined;

    ngOnInit() {
        this.generateInitialData();
        this.updateSubscription = interval(100).subscribe(() => {
            this.updateRandomValues();
        });
    }

    ngOnDestroy() {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
    }

    generateInitialData() {
        const albums = [
            { name: 'Rumours', artist: 'Fleetwood Mac', year: 1977, genre: 'Soft Rock' },
            { name: 'Future Nostalgia', artist: 'Dua Lipa', year: 2020, genre: 'Pop' },
            { name: 'Actually', artist: 'Pet Shop Boys', year: 1987, genre: 'Synth-pop' },
            { name: 'Back to Black', artist: 'Amy Winehouse', year: 2006, genre: 'Rhythm & Blues' }
        ];

        this.rowData = albums.map(album => this.generateRowData(album));
    }

    updateRandomValues() {
        const randomIndex = Math.floor(Math.random() * this.rowData.length);
        const updatedRow = { ...this.rowData[randomIndex], ...this.generateRandomValues() };
        this.rowData = [
            ...this.rowData.slice(0, randomIndex),
            updatedRow,
            ...this.rowData.slice(randomIndex + 1)
        ];
        if (this.gridApi) {
            // Update only the changed row
            const rowNode = this.gridApi.getDisplayedRowAtIndex(randomIndex);
            if (rowNode) {
                rowNode.setData(updatedRow);
            }
        }
    }

    generateRowData(album: any) {
        return {
            ...album,
            ...this.generateRandomValues()
        };
    }

    generateRandomValues() {
        return {
            status: this.getRandomStatus(),
            inventory: `${this.getRandomNumber(0, 50)} Stock / ${this.getRandomNumber(1, 5)} Variant`,
            incoming: this.getRandomNumber(0, 50),
            price: `£${this.getRandomNumber(20, 50)}`,
            sold: this.getRandomNumber(0, 100),
            estProfit: `£${this.getRandomNumber(50, 200)}`
        };
    }

    getRandomStatus() {
        const statuses = ['Active', 'Out of Stock', 'On Hold'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    albumRenderer(params: any) {
        return `
      <div style="display: flex; align-items: center;">
        <div style="width: 40px; height: 40px; background-color: #3498db; margin-right: 10px;"></div>
        <div>
          <div>${params.value}</div>
          <div style="font-size: 0.8em; color: #95a5a6;">${params.data.genre}</div>
        </div>
      </div>
    `;
    }

    statusRenderer(params: any) {
        const statusClass = params.value.toLowerCase().replace(' ', '-');
        return `<span class="status-${statusClass}">● ${params.value}</span>`;
    }
}