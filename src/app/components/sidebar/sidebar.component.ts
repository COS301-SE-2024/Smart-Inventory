import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { signOut } from 'aws-amplify/auth';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { fetchAuthSession } from 'aws-amplify/auth';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MaterialModule, CommonModule, RouterLink, FormsModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    isExpanded = false;
    sidebarWidth = 300; // Default sidebar width
    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', routerLink: '/dashboard', roles: ['admin', 'inventorycontroller'] },
        {
            label: 'Inventory',
            icon: 'inventory_2',
            routerLink: '/inventory',
            roles: ['admin', 'inventorycontroller', 'enduser'],
        },
        { label: 'Reports', icon: 'assessment', routerLink: '/reports', roles: ['admin', 'inventorycontroller'] },
        { label: 'Team', icon: 'people', routerLink: '/team', roles: ['admin'] },
        {
            label: 'Suppliers',
            icon: 'local_shipping',
            routerLink: '/suppliers',
            roles: ['admin', 'inventorycontroller'],
        },
        { label: 'Orders', icon: 'assignment', routerLink: '/orders', roles: ['admin', 'inventorycontroller'] },
        { label: 'Help', icon: 'help', routerLink: '/help', roles: ['admin', 'inventorycontroller', 'enduser'] },
        { label: 'Log Out', icon: 'exit_to_app', click: true, roles: ['admin', 'inventorycontroller', 'enduser'] },
    ];

    constructor(private router: Router) {}

    ngOnInit() {
        this.logAuthSession();
    }

    filteredMenuItems: any[] = [];
    role: string = '';

    async logAuthSession() {
        try {
            const session = await fetchAuthSession();
            this.role = '' + session.tokens?.idToken?.payload?.['cognito:groups']?.toString();
            this.filterMenuItems();
        } catch (error) {
            console.error('Error fetching auth session:', error);
        }
    }

    filterMenuItems() {
        this.filteredMenuItems = this.menuItems.filter((item) => {
            if (this.role === 'admin') {
                return true;
            } else if (this.role === 'inventorycontroller') {
                return item.roles.includes('inventorycontroller');
            } else {
                return item.roles.includes('enduser');
            }
        });
    }

    toggle(item: any): void {
        if (item.submenu) {
            item.expanded = !item.expanded;
        }
    }

    originalWidth: string = '200px'; // Original width of the sidenav
    expandedWidth: string = '300px'; // Expanded width of the sidenav

    // This method toggles the sidenav and changes its width
    toggleSidenav() {
        this.isExpanded = !this.isExpanded; // Toggle the expansion state
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
