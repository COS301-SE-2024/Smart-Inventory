import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../components/header/title.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: string = "John Doe";
  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.updateTitle('Dashboard');
  }
}
