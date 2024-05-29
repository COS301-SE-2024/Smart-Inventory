import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {

  public pages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Inventory', url: '/inventory', icon: 'cube' },
    { title: 'Reports', url: '/reports', icon: 'stats-chart' },
    { title: 'Requests', url: '/requests', icon: 'clipboard' },
    { title: 'Suppliers', url: '/suppliers', icon: 'people' },
    { title: 'Orders', url: '/orders', icon: 'bag-handle' }
  ];

  constructor() { }

  ngOnInit() {
    console.log('Side Navigation Loaded');
  }
  
}
