import { Component, OnInit, ViewChild, HostListener, Inject } from '@angular/core';
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

interface Notification {
    id: number;
    type: string;
    title: string;
    date: Date;
    info: string;
    read: boolean;
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
        DatePipe,
        MatTabsModule,
        MatListModule,
        MatIconModule, 
        MatCheckbox,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        NotificationDialogComponent,
        MatTooltipModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

    // resizing notification panel
    panelWidth: number = 400; 
    isResizing: boolean = false;

    pageTitle: string = '';
    userName: string = '';
    userEmail: string = '';

    notifications: Notification[] = [
        { id: 1, type: 'Inventory', title: 'Low stock alert', date: new Date(), info: 'Item A is running low', read: false },
        { id: 2, type: 'Reports', title: 'Monthly report ready', date: new Date(), info: 'Your monthly report is available', read: true },
        { id: 3, type: 'Settings', title: 'New feature available', date: new Date(), info: 'Check out our new dashboard feature', read: false },
        { id: 4, type: 'Orders', title: 'New order received', date: new Date(), info: 'Order #1234 needs processing', read: true },
        { id: 5, type: 'Suppliers', title: 'Supplier update', date: new Date(), info: 'Supplier X has new contact information', read: false },
        { id: 6, type: 'Teams', title: 'New team member', date: new Date(), info: 'Welcome John Doe to the team', read: true },
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
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.titleService.currentTitle.subscribe((title) => (this.pageTitle = title));
        this.loadUserInfo();
        this.filteredNotifications = this.notifications;
        this.updateFilteredNotifications();
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

    onTabChange(index: number) {
        const filters = ['All', 'Inventory', 'Reports', 'Settings', 'Orders', 'Suppliers', 'Teams'];
        this.filterNotifications(filters[index]);
    }

    selectFilter(filter: string) {
        this.activeFilter = filter;
        this.filterNotifications(filter);
    }

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
        this.filteredNotifications = this.notifications.filter(n => {
            if (this.showRead && this.showUnread) {
                return true;
            } else if (this.showRead) {
                return n.read;
            } else if (this.showUnread) {
                return !n.read;
            }
            return false;
        });

        if (this.activeFilter !== 'All') {
            this.filteredNotifications = this.filteredNotifications.filter(n => n.type === this.activeFilter);
        }

        this.filteredNotifications.sort((a, b) => {
            if (a.read === b.read) return 0;
            return a.read ? 1 : -1;
        });

        this.unreadCount = this.notifications.filter(n => !n.read).length;
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
}


