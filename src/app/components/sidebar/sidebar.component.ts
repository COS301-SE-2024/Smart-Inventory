import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { signOut } from 'aws-amplify/auth';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ThemeService } from 'app/services/theme.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MaterialModule, CommonModule, RouterLink, FormsModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
    @ViewChild('sidenav', { static: true }) sidenav!: ElementRef;
    isExpanded = false;
    isHovered = false;
    isDarkMode = false;
    userName = 'John Doe';
    userAvatar = 'assets/default-avatar.png';
    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', routerLink: '/dashboard', roles: ['admin', 'inventorycontroller'] },
        { label: 'Inventory', icon: 'inventory_2', routerLink: '/inventory', roles: ['admin', 'inventorycontroller', 'enduser'] },
        { label: 'Reports', icon: 'assessment', routerLink: '/reports', roles: ['admin', 'inventorycontroller'] },
        { label: 'Team', icon: 'people', routerLink: '/team', roles: ['admin'] },
        { label: 'Suppliers', icon: 'local_shipping', routerLink: '/suppliers', roles: ['admin', 'inventorycontroller'] },
        { label: 'Orders', icon: 'assignment', routerLink: '/orders', roles: ['admin', 'inventorycontroller'] },
        { label: 'Help', icon: 'help', routerLink: '/help', roles: ['admin', 'inventorycontroller', 'enduser'] },
        { label: 'Log Out', icon: 'exit_to_app', click: true, roles: ['admin', 'inventorycontroller', 'enduser'] },
    ];

    filteredMenuItems: any[] = [];
    role: string = '';
    @Output() darkModeChanged = new EventEmitter<boolean>();
    constructor(public router: Router, private renderer: Renderer2, private themeService: ThemeService,) {}

    ngOnInit() {
        this.logAuthSession();
        this.loadUserPreferences();
        this.themeService.isDarkMode$.subscribe((isDarkMode: boolean) => {
            this.isDarkMode = isDarkMode;
          });
    }

    @HostListener('mouseenter')
    onMouseEnter() {
        this.isHovered = true;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.isHovered = false;
    }

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

    toggleSidenav() {
        this.isExpanded = !this.isExpanded;
    }

    toggleDarkMode() {
        this.themeService.toggleDarkMode();
    }

    loadUserPreferences() {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode) {
            this.isDarkMode = JSON.parse(darkMode);
            if (this.isDarkMode) {
                this.renderer.addClass(document.body, 'dark-mode');
            }
        }
    }

    saveUserPreferences() {
        localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
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