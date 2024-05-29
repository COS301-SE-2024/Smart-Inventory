import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  menuEnabled: boolean = false;
  appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Inventory', url: '/inventory', icon: 'cube' },
    { title: 'Reports', url: '/reports', icon: 'stats-chart' },
    { title: 'Requests', url: '/requests', icon: 'clipboard' },
    { title: 'Suppliers', url: '/suppliers', icon: 'people' },
    { title: 'Orders', url: '/orders', icon: 'bag-handle' }
  ];
  
  // public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private menuController: MenuController) { }

  ngOnInit() {
    this.menuController.enable(true);  // Ensures menu is disabled on startup
  }

  toggleMenu() {
    this.menuController.toggle();  // Toggle the menu open or closed
  }
}
