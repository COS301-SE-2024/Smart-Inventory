import { Component } from '@angular/core';
import { TitleService } from '../header/title.service';

@Component({
  selector: 'app-stock-request-report',
  standalone: true,
  imports: [],
  templateUrl: './stock-request-report.component.html',
  styleUrl: './stock-request-report.component.css'
})
export class StockRequestReportComponent {

  constructor(
    private titleService: TitleService,
  ) {}

  async ngOnInit() {
    this.titleService.updateTitle('Stock Requests Report');
  }

}
