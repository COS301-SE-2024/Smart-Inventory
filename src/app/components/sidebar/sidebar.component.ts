import { Component, HostBinding, HostListener, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { signOut } from 'aws-amplify/auth';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterLink, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isExpanded = false;
  sidebarWidth = 300; // Default sidebar width
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Inventory', icon: 'inventory' },
    { label: 'Reports', icon: 'bar_chart' },
    { label: 'Requests', icon: 'assignment' },
    { label: 'Suppliers', icon: 'group' },
    { label: 'Orders', icon: 'shopping_cart' }
  ];
  constructor(private router: Router) { }

  toggle(item: any): void {
    if (item.submenu) {
      item.expanded = !item.expanded;
    }
  }

  originalWidth: string = '200px';  // Original width of the sidenav
  expandedWidth: string = '300px';  // Expanded width of the sidenav

  // This method toggles the sidenav and changes its width
  toggleSidenav() {
    this.isExpanded = !this.isExpanded;  // Toggle the expansion state
    // this.sidenav.toggle();  // Toggle the visibility of the sidenav
  }


  async signOut() {
    try {
      await signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
