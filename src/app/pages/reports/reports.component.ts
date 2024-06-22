import { Component } from '@angular/core';
import { TitleService } from '../../components/header/title.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css',
})
export class ReportsComponent {
    constructor(private titleService: TitleService) {}
    ngOnInit() {
        this.titleService.updateTitle('Reports');
    }
}
