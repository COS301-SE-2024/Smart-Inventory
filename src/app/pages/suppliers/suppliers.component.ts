import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [GridComponent, MatButtonModule],
    templateUrl: './suppliers.component.html',
    styleUrl: './suppliers.component.css',
})
export class SuppliersComponent {
    constructor(private titleService: TitleService) {}
    ngOnInit() {
        this.titleService.updateTitle('Suppliers');
    }
    rowData = [
        { Supplier_ID: '#101', Company_Name: 'Amazon', Email: 'Amazon@gmail.com' },
        { Supplier_ID: '#102', Company_Name: 'Takealot', Email: 'Takealot@gmail.com' },
        { Supplier_ID: '#104', Company_Name: 'Gumtree', Email: 'gumtrtee@gmail.com' },
        { Supplier_ID: '#108', Company_Name: 'Pnp', Email: 'pnp@gmail.com' },
    ];

    // Column Definitions: Defines & controls grid columns.
    colDefs: any[] = [
        { field: 'Supplier_ID', filter: 'agSetColumnFilter', editable: true },
        { field: 'Company_Name', filter: 'agSetColumnFilter', editable: true },
        { field: 'Email', filter: 'agSetColumnFilter', editable: true },
    ];

    defaultColDef: ColDef = {
        flex: 1,
        editable: true,
    };
}
