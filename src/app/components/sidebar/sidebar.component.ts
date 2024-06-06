import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Import Router for navigation
import { signOut } from 'aws-amplify/auth';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterLink], // Update imports
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {


  constructor(private router: Router) { } // Inject Router

  isExpanded = true;
  
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Inventory', icon: 'inventory', route: '/inventory' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports' },
    { label: 'Requests', icon: 'assignment', route: '/requests' },
    { label: 'Suppliers', icon: 'group', route: '/suppliers' },
    { label: 'Orders', icon: 'shopping_cart', route: '/orders' },
  ];

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }

  async signOut() { // Renamed to avoid confusion with `signOut` from Amplify
    try {
      await signOut();
      this.router.navigate(['/login']); // Redirect after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
