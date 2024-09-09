import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

interface Notification {
    id: number;
    type: string;
    title: string;
    date: Date;
    info: string;
    read: boolean;
    archived: boolean;
}

interface NotificationSetting {
    name: string;
    enabled: boolean;
}

@Component({
    selector: 'app-notifications-side-pane',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    templateUrl: './notifications-side-pane.component.html',
    styleUrls: ['./notifications-side-pane.component.css']
})
export class NotificationsSidePaneComponent implements OnInit {
    @Input() isPanelOpen: boolean = false;
    @Output() closePanel = new EventEmitter<void>();
    @Output() unreadCountChange = new EventEmitter<number>();

    panelWidth: number = 400;
    notifications: Notification[] = [
        { id: 1, type: 'Inventory', title: 'Low stock alert', date: new Date(), info: 'Item A is running low', read: false, archived: false },
        { id: 2, type: 'Reports', title: 'Monthly report ready', date: new Date(), info: 'Your monthly report is available', read: true, archived: false },
        { id: 3, type: 'Orders', title: 'New order received', date: new Date(), info: 'Order #1234 needs processing', read: true, archived: false },
        { id: 4, type: 'Suppliers', title: 'Supplier update', date: new Date(), info: 'Supplier X has new contact information', read: false, archived: false },
        { id: 5, type: 'Teams', title: 'New team member', date: new Date(), info: 'Welcome John Doe to the team', read: true, archived: false },
    ];
    filteredNotifications: Notification[] = [];
    activeFilter: string = 'All';
    filters: string[] = ['All', 'Inventory', 'Reports', 'Orders', 'Suppliers', 'Teams', 'Settings'];
    showRead: boolean = true;
    showUnread: boolean = true;
    unreadCount: number = 0;
    showArchived: boolean = false;
    notificationSettings: NotificationSetting[] = [
        { name: 'Inventory', enabled: true },
        { name: 'Reports', enabled: true },
        { name: 'Orders', enabled: true },
        { name: 'Suppliers', enabled: true },
        { name: 'Teams', enabled: true },
    ];

    constructor(private dialog: MatDialog) {}

    ngOnInit() {
        this.updateFilteredNotifications();
    }

    closeNotificationPanel() {
        this.closePanel.emit();
    }

    onTabChange(index: number) {
        this.filterNotifications(this.filters[index]);
    }

    filterNotifications(filter: string) {
        this.activeFilter = filter;
        this.updateFilteredNotifications();
    }

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
        this.unreadCountChange.emit(this.unreadCount);
    }

    toggleArchive(event: Event, notification: Notification) {
        event.stopPropagation();
        notification.archived = !notification.archived;
        this.updateFilteredNotifications();
    }

    toggleReadStatus(event: Event, notification: Notification) {
        event.stopPropagation();
        notification.read = !notification.read;
        this.updateFilteredNotifications();
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateFilteredNotifications();
    }

    updateNotificationSettings(setting: NotificationSetting) {
        this.filters = ['All', 'Settings'];
        this.notificationSettings.forEach(s => {
            if (s.enabled) {
                this.filters.push(s.name);
            }
        });

        this.updateFilteredNotifications();

        if (!this.filters.includes(this.activeFilter)) {
            this.activeFilter = 'All';
        }

        this.saveNotificationSettings();
    }

    saveNotificationSettings() {
        console.log('Saving notification settings:', this.notificationSettings);
        // Implement actual saving logic here
    }

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
        // Implement resize logic here if needed
    }
}