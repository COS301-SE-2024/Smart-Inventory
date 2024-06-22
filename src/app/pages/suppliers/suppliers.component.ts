import { Component } from '@angular/core';
import { TitleService } from '../../components/header/title.service';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [],
    templateUrl: './suppliers.component.html',
    styleUrl: './suppliers.component.css',
})
export class SuppliersComponent {
    constructor(private titleService: TitleService) {}
    ngOnInit() {
        this.titleService.updateTitle('Suppliers');
    }
}
