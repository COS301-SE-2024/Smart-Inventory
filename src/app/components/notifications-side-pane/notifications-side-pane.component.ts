import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef, Renderer2 } from '@angular/core';
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

    panelWidth: number = 800;
    isResizing: boolean = false;
    minWidth: number = 400;
    maxWidth: number = 1200;
    notifications: Notification[] = [
        { id: 1, type: 'Inventory', title: 'Low stock alert', date: new Date(), info: 'Item A is running low', read: false },
        { id: 2, type: 'Orders', title: 'New order received', date: new Date(), info: 'Order #1234 needs processing', read: true },
        { id: 3, type: 'Suppliers', title: 'Supplier update', date: new Date(), info: 'Supplier X has new contact information', read: false },
        { id: 4, type: 'Teams', title: 'New team member', date: new Date(), info: 'Welcome John Doe to the team', read: true },
    ];
    filteredNotifications: Notification[] = [];
    activeFilter: string = 'All';
    activeTab: string = 'All';
    filters: string[] = ['All', 'Unread', 'Read'];
    tabs: string[] = ['All', 'Inventory', 'Orders', 'Suppliers', 'Teams', 'Settings'];
    unreadCount: number = 0;
    notificationSettings: NotificationSetting[] = [
        { name: 'Inventory', enabled: true },
        { name: 'Orders', enabled: true },
        { name: 'Suppliers', enabled: true },
        { name: 'Teams', enabled: true },
    ];

    constructor(private dialog: MatDialog, private el: ElementRef, private renderer: Renderer2) {}

    ngOnInit() {
        this.updateFilteredNotifications();
    }

    closeNotificationPanel() {
        this.closePanel.emit();
    }

    onTabChange(tabName: string) {
        this.activeTab = tabName;
        this.updateFilteredNotifications();
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

            if (this.activeTab !== 'All' && this.activeTab !== 'Settings' && n.type !== this.activeTab) {
                return false;
            }

            if (this.activeFilter === 'All') {
                return true;
            } else if (this.activeFilter === 'Unread') {
                return !n.read;
            } else if (this.activeFilter === 'Read') {
                return n.read;
            }
            
            return false;
        });
    
        this.filteredNotifications.sort((a, b) => {
            if (a.read === b.read) return 0;
            return a.read ? 1 : -1;
        });
    
        this.unreadCount = this.notifications.filter(n => !n.read && this.notificationSettings.find(s => s.name === n.type)?.enabled).length;
        this.unreadCountChange.emit(this.unreadCount);
    }

    markAsRead(event: Event, notification: Notification) {
        event.stopPropagation();
        notification.read = true;
        this.updateFilteredNotifications();
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateFilteredNotifications();
    }

    updateNotificationSettings(setting: NotificationSetting) {
        this.tabs = ['All'];
        this.notificationSettings.forEach(s => {
            if (s.enabled) {
                this.tabs.push(s.name);
            }
        });
        this.tabs.push('Settings');

        this.updateFilteredNotifications();

        this.saveNotificationSettings();
    }

    saveNotificationSettings() {
        console.log('Saving notification settings:', this.notificationSettings);
        // Implement actual saving logic here
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'Inventory': return 'inventory';
            case 'Orders': return 'shopping_cart';
            case 'Suppliers': return 'business';
            case 'Teams': return 'group';
            default: return 'notifications';
        }
    }

    startResize(event: MouseEvent) {
        event.preventDefault();
        this.isResizing = true;
        this.renderer.addClass(document.body, 'resize-active');
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (this.isResizing) {
            const newWidth = window.innerWidth - event.clientX;
            this.panelWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
            this.renderer.setStyle(this.el.nativeElement.querySelector('.notification-panel'), 'width', `${this.panelWidth}px`);
        }
    }

    @HostListener('document:mouseup')
    onMouseUp() {
        if (this.isResizing) {
            this.isResizing = false;
            this.renderer.removeClass(document.body, 'resize-active');
        }
    }

    onNotificationClick(notification: Notification) {
        if (!notification.read) {
            this.markAsRead(new Event('click'), notification);
        }
        console.log('Notification clicked:', notification);
    }
}