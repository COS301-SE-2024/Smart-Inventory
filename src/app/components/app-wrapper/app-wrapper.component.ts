import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'app/app.component';
import { LocalStorageCleanerService } from 'app/services/localstorage-cleaner.service';

@Component({
  selector: 'app-wrapper',
  template: '<app-root></app-root>',
  standalone: true,
  imports: [AppComponent]
})
export class AppWrapperComponent implements OnInit {
  constructor(private localStorageCleaner: LocalStorageCleanerService) {}

  async ngOnInit() {
    await this.localStorageCleaner.moveToCache();
  }
}