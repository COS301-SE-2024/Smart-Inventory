import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { TitleService } from './title.service';
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

interface Notification {
    type: string;
    title: string;
    date: Date;
    info: string;
    read: boolean;
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        DatePipe,
        MatTabsModule,
        MatListModule,
        MatIconModule, 
        MatCheckbox,
        FormsModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
    // @ViewChild('tabGroup') tabGroup!: MatTabGroup;

    // resizing notification panel
    panelWidth: number = 400; 
    isResizing: boolean = false;

    pageTitle: string = '';
    userName: string = '';
    userEmail: string = '';

    notifications: Notification[] = [
        { type: 'Inventory', title: 'Low stock alert', date: new Date(), info: 'Item A is running low', read: false },
        { type: 'Reports', title: 'Monthly report ready', date: new Date(), info: 'Your monthly report is available', read: true },
        { type: 'Settings', title: 'New feature available', date: new Date(), info: 'Check out our new dashboard feature', read: false },
        { type: 'Orders', title: 'New order received', date: new Date(), info: 'Order #1234 needs processing', read: true },
        { type: 'Suppliers', title: 'Supplier update', date: new Date(), info: 'Supplier X has new contact information', read: false },
        { type: 'Teams', title: 'New team member', date: new Date(), info: 'Welcome John Doe to the team', read: true },
    ];
    
    filteredNotifications: Notification[] = [];
    activeFilter: string = 'All';

    isNotificationPanelOpen: boolean = false;
    filters: string[] = ['All', 'Inventory', 'Reports', 'Settings', 'Orders', 'Suppliers', 'Teams'];
    
    showRead: boolean = true;
    showUnread: boolean = true;
    unreadCount: number = 0;
    
    constructor(
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private auth: AuthenticatorService,
        private router: Router
    ) {}

    ngOnInit() {
        this.titleService.currentTitle.subscribe((title) => (this.pageTitle = title));
        this.loadUserInfo();
        this.filteredNotifications = this.notifications;
        this.updateFilteredNotifications();
    }

    // ngAfterViewInit() {
    //     this.tabGroup.selectedIndexChange.subscribe((index) => {
    //         this.filterNotifications(this.filters[index]);
    //     });
    // }

    // LOADER
    loadUserInfo() {
        this.cognitoService.getCurrentUserAttributes().subscribe(
            (attributes) => {
                this.userName = `${attributes['given_name'] || ''} ${attributes['family_name'] || ''}`.trim();
                this.userEmail = attributes['email'] || '';
            },
            (error) => {
                console.error('Error loading user info:', error);
            }
        );
    }

    // LOGOUT
    async logout() {
        try {
            await signOut();
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    // NOTIFICATIONS FUNCTIONS
    toggleNotificationPanel() {
        this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    }

    closeNotificationPanel() {
        this.isNotificationPanelOpen = false;
    }

    onTabChange(index: number) {
        const filters = ['All', 'Inventory', 'Reports', 'Settings', 'Orders', 'Suppliers', 'Teams'];
        this.filterNotifications(filters[index]);
    }

    selectFilter(filter: string) {
        this.activeFilter = filter;
        this.filterNotifications(filter);
    }

    // filterNotifications(filter: string) {
    //     if (filter === 'All') {
    //         this.filteredNotifications = this.notifications;
    //     } else {
    //         this.filteredNotifications = this.notifications.filter(n => n.type === filter);
    //     }
    // }

    filterNotifications(filter: string) {
        this.activeFilter = filter;
        this.updateFilteredNotifications();
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'Inventory': return 'inventory';
            case 'Reports': return 'assessment';
            case 'Settings': return 'settings';
            case 'Orders': return 'shopping_cart';
            case 'Suppliers': return 'business';
            case 'Teams': return 'group';
            default: return 'notifications';
        }
    }

    startResize(event: MouseEvent) {
        this.isResizing = true;
        event.preventDefault();
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (!this.isResizing) return;
        
        const screenWidth = window.innerWidth;
        const newWidth = screenWidth - event.clientX;
        
        // Set minimum and maximum widths
        this.panelWidth = Math.max(300, Math.min(newWidth, screenWidth * 0.8));
    }

    @HostListener('window:mouseup')
    onMouseUp() {
        this.isResizing = false;
    }

    // update filtered notifications
    updateFilteredNotifications() {
        this.filteredNotifications = this.notifications.filter(n => 
            (this.showRead && n.read) || (this.showUnread && !n.read)
        );
        if (this.activeFilter !== 'All') {
            this.filteredNotifications = this.filteredNotifications.filter(n => n.type === this.activeFilter);
        }
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }

    // Add this method to toggle read/unread filters
    toggleFilter(type: 'read' | 'unread') {
        if (type === 'read') {
            this.showRead = !this.showRead;
        } else {
            this.showUnread = !this.showUnread;
        }
        this.updateFilteredNotifications();
    }
    
}
