import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, Inject } from '@angular/core';
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
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatMenuTrigger } from '@angular/material/menu';
// import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';

interface Notification {
    id: number;
    type: string;
    title: string;
    date: Date;
    info: string;
    read: boolean;
    archived: boolean;
}

// HEY TRISTAN !!
interface NotificationSetting {
    name: string;
    enabled: boolean;
}

// Pop Up Notification
@Component({
    selector: 'app-notification-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        DatePipe,
    ],
    template: `
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <mat-dialog-content>
            <p>{{ data.info }}</p>
            <p>Date: {{ data.date | date:'short' }}</p>
            <p>Type: {{ data.type }}</p>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button [mat-dialog-close]="true">Close</button>
        </mat-dialog-actions>
    `,
})
export class NotificationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: Notification) {}
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        DatePipe,
        MatTabsModule,
        MatListModule,
        MatIconModule,
        MatCheckbox,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        NotificationDialogComponent,
        MatTooltipModule,
        MatMenuModule,
        MatMenuTrigger
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

    @ViewChild('MatMenuTrigger') trigger!: MatMenuTrigger;
    @ViewChild('filterMenuTrigger') filterMenuTrigger!: MatMenuTrigger;

    isScrolledToStart: boolean = true;
    isScrolledToEnd: boolean = false;

    // resizing notification panel
    panelWidth: number = 400;
    isResizing: boolean = false;

    pageTitle: string = '';
    userName: string = '';
    userEmail: string = '';

    // HEY TRISTAN!!!
    notifications: Notification[] = [
        { id: 1, type: 'Inventory', title: 'Low stock alert', date: new Date(), info: 'Item A is running low', read: false, archived: false },
        { id: 2, type: 'Reports', title: 'Monthly report ready', date: new Date(), info: 'Your monthly report is available', read: true, archived: false },
        { id: 3, type: 'Orders', title: 'New order received', date: new Date(), info: 'Order #1234 needs processing', read: true, archived: false },
        { id: 4, type: 'Suppliers', title: 'Supplier update', date: new Date(), info: 'Supplier X has new contact information', read: false, archived: false },
        { id: 5, type: 'Teams', title: 'New team member', date: new Date(), info: 'Welcome John Doe to the team', read: true, archived: false },
    ];
    
    
    
    filteredNotifications: Notification[] = [];
    activeFilter: string = 'All';

    // HEY TRISTAN !!
    // filter notifications
    isNotificationPanelOpen: boolean = false;
    filters: string[] = ['All', 'Inventory', 'Reports', 'Orders', 'Suppliers', 'Teams', 'Settings'];
    showRead: boolean = true;
    showUnread: boolean = true;
    unreadCount: number = 0;
    // archived notifications
    showArchived: boolean = false;

    // HIDE FILTER ACCORDING TO NOTIFICATIONS SETTINGS
    notificationSettings: NotificationSetting[] = [
        { name: 'Inventory', enabled: true },
        { name: 'Reports', enabled: true },
        { name: 'Orders', enabled: true },
        { name: 'Suppliers', enabled: true },
        { name: 'Teams', enabled: true },
    ];
    
    constructor(
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private auth: AuthenticatorService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    
    @HostListener('window:resize', ['$event']) onResize(event: Event) {
        this.updateFilterSize();
    }

    updateFilterSize() {
        const panelWidth = this.panelWidth;
        const minWidth = 400; // Minimum panel width
        const maxWidth = 600; // Maximum panel width for scaling

        // Calculate scale factor (0 to 1)
        const scale = Math.min(Math.max((panelWidth - minWidth) / (maxWidth - minWidth), 0), 1);

        // Update CSS variables
        document.documentElement.style.setProperty('--filter-font-size', `${12 + scale * 4}px`);
        document.documentElement.style.setProperty('--filter-icon-size', `${16 + scale * 8}px`);
        document.documentElement.style.setProperty('--filter-padding', `${4 + scale * 4}px ${8 + scale * 8}px`);
    }

    ngOnInit() {
        this.titleService.currentTitle.subscribe((title) => (this.pageTitle = title));
        this.loadUserInfo();
        this.filteredNotifications = this.notifications;
        this.updateFilteredNotifications();
        this.loadNotificationSettings(); // implement later
    }

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

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateFilteredNotifications();
    }

    toggleNotificationPanel() {
        this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    }

    closeNotificationPanel() {
        this.isNotificationPanelOpen = false;
    }

    closeFilterMenu() {
        this.filterMenuTrigger.closeMenu();
    }

    onTabChange(index: number) {
        this.filterNotifications(this.filters[index]);
    }

    selectFilter(filter: string) {
        this.activeFilter = filter;
        this.filterNotifications(filter);
    }

    filterNotifications(filter: string) {
        this.activeFilter = filter;
        this.updateFilteredNotifications();
    }

    // HEY TRISTAN !!
    getNotificationIcon(type: string): string {
        switch (type) {
            case 'Inventory': return 'inventory';
            case 'Reports': return 'assessment';
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

    toggleArchive(event: Event, notification: Notification) {
        event.stopPropagation();
        notification.archived = !notification.archived;
        this.updateFilteredNotifications();
    }

    // HEY TRISTAN !!
    // update filtered notifications
    updateFilteredNotifications() {
        this.filteredNotifications = this.notifications.filter(n => {
            const settingEnabled = this.notificationSettings.find(s => s.name === n.type)?.enabled;
            
            if (!settingEnabled) {
                return false;
            }

            if (this.activeFilter !== 'All' && this.activeFilter !== 'Settings' && n.type !== this.activeFilter) {
                return false;
            }

            if (this.showArchived && n.archived) {
                return true;
            }
            
            if (!n.archived) {
                if (this.showRead && this.showUnread) {
                    return true;
                } else if (this.showRead) {
                    return n.read;
                } else if (this.showUnread) {
                    return !n.read;
                }
            }
            
            return false;
        });
    
        this.filteredNotifications.sort((a, b) => {
            if (a.archived === b.archived) {
                if (a.read === b.read) return 0;
                return a.read ? 1 : -1;
            }
            return a.archived ? 1 : -1;
        });
    
        this.unreadCount = this.notifications.filter(n => !n.read && !n.archived && this.notificationSettings.find(s => s.name === n.type)?.enabled).length;
    }


    toggleShowArchived() {
        this.showArchived = !this.showArchived;
        this.updateFilteredNotifications();
    }

    toggleReadStatus(event: Event, notification: Notification) {
        event.stopPropagation(); // Prevent the notification dialog from opening
        notification.read = !notification.read;
        this.updateFilteredNotifications();
    }

    openNotification(notification: Notification) {
        const dialogRef = this.dialog.open(NotificationDialogComponent, {
            width: '400px',
            data: notification
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                notification.read = true;
                this.updateFilteredNotifications();
            }
        });
    }

    // toggle read/unread filters
    toggleFilter(type: 'read' | 'unread') {
        if (type === 'read') {
            this.showRead = !this.showRead;
        } else {
            this.showUnread = !this.showUnread;
        }
        this.updateFilteredNotifications();
    }

    // HEY TRISTAN !!
    // quick explanation users can filter which notifications to see and which not to see, 
    // notifications they dont want to see, won't show in the notification tab
    // all controlled in the settings :)
    
    updateNotificationSettings(setting: NotificationSetting) {
        // Update the filters based on the enabled settings
        this.filters = ['All', 'Settings'];
        this.notificationSettings.forEach(s => {
            if (s.enabled) {
                this.filters.push(s.name);
            }
        });

        // Update the filtered notifications
        this.updateFilteredNotifications();

        // If the current filter is disabled, switch to 'All'
        if (!this.filters.includes(this.activeFilter)) {
            this.activeFilter = 'All';
        }

        // Save settings
        this.saveNotificationSettings();
    }
    
    saveNotificationSettings() {
        console.log('Saving notification settings:', this.notificationSettings);
    }

    // u can implement this later to save the users notifications settings for the session //  backend stuff
    loadNotificationSettings() {
        // Implement logic to load settings from local storage or backend
        
    }
}