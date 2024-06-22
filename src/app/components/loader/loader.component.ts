import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent implements OnInit {
  isLoading: boolean = false;

  ngOnInit() {
    this.isLoading = true;
    // Simulate loading data (e.g., from an API)
    setTimeout(() => {
      this.isLoading = false;
    }, 2000); // Assume loading takes 2 seconds
  }
}
