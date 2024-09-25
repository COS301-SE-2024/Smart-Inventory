import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { fetchAuthSession } from 'aws-amplify/auth';
import { NotificationsService } from '../../../../amplify/services/notifications.service';
import { NotificationService } from '../../../../amplify/services/supplier-form-services/notification.service';

interface Notification {
    notificationId: string;
    tenentId: string;
    message: string;
    isRead: boolean;
    type: string;
    timestamp: string;
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
    tenentId: string = '';
    notifications: Notification[] = [];
    filteredNotifications: Notification[] = [];
    activeFilter: string = 'All';
    activeTab: string = 'All';
    filters: string[] = ['All', 'Unread', 'Read'];
    tabs: string[] = ['All', 'Inventory', 'Suppliers', 'Users', 'Quotes', 'Settings'];
    unreadCount: number = 0;
    notificationSettings: NotificationSetting[] = [
        { name: 'Inventory', enabled: true },
        { name: 'Suppliers', enabled: true },
        { name: 'Users', enabled: true },
        { name: 'Quotes', enabled: true },
    ];

    constructor(
        private dialog: MatDialog, 
        private el: ElementRef, 
        private renderer: Renderer2,
        private notificationsService: NotificationService
    ) {}

    async ngOnInit() {
        try {
            const session = await fetchAuthSession();
            this.tenentId = await this.getTenentId(session);
            await this.fetchNotifications();
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    async fetchNotifications() {
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const params = {
                FunctionName: 'getNotifications', // Replace with your actual Lambda function name if different
                Payload: new TextEncoder().encode(JSON.stringify({
                    tenentId: this.tenentId,
                    limit: 200, // Adjust as needed
                    lastEvaluatedKey: null // For initial fetch
                })),
            };

            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            const payload = JSON.parse(new TextDecoder().decode(response.Payload));
            
            if (payload.statusCode === 200) {
                const body = JSON.parse(payload.body);
                
                this.notifications = body.notifications.map((n: any) => ({
                    ...n,
                    isRead: n.isRead === true,
                    date: new Date(n.timestamp)
                }));
                
                this.updateFilteredNotifications();
            } else {
                throw new Error(payload.body || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    async getTenentId(session: any): Promise<string> {
        const cognitoClient = new CognitoIdentityProviderClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
        });

        const getUserCommand = new GetUserCommand({
            AccessToken: session.tokens?.accessToken.toString(),
        });
        const getUserResponse = await cognitoClient.send(getUserCommand);

        const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

        if (!tenentId) {
            throw new Error('TenentId not found in user attributes');
        }

        return tenentId;
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
            const settingEnabled = this.notificationSettings.find(s => s.name === this.getNotificationCategory(n.type))?.enabled;
            
            if (!settingEnabled) {
                return false;
            }

            if (this.activeTab !== 'All' && this.activeTab !== 'Settings' && this.getNotificationCategory(n.type) !== this.activeTab) {
                return false;
            }

            if (this.activeFilter === 'All') {
                return true;
            } else if (this.activeFilter === 'Unread') {
                return !n.isRead;
            } else if (this.activeFilter === 'Read') {
                return n.isRead;
            }
            
            return false;
        });
    
        this.filteredNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
        this.unreadCount = this.notifications.filter(n => !n.isRead && this.notificationSettings.find(s => s.name === this.getNotificationCategory(n.type))?.enabled).length;
        this.unreadCountChange.emit(this.unreadCount);
    }

    getNotificationCategory(type: string): string {
        const inventoryTypes = ['NEW_INVENTORY_ITEM', 'INVENTORY_ITEM_DELETED', 'QUANTITY_UPDATE', 'EXPIRATION_DATE_UPDATE', 'ITEM_DESCRIPTION_UPDATE', 'ITEM_REORDERAMOUNT_UPDATE', 'ITEM_LOWSTOCKTHRESHOLD_UPDATE'];
        const supplierTypes = ['NEW_SUPPLIER', 'SUPPLIER_CONTACT_UPDATE_REQUEST', 'SUPPLIER_CONTACT_UPDATE', 'SUPPLIER_PHONE_UPDATE', 'SUPPLIER_EMAIL_UPDATE', 'SUPPLIER_ADDRESS_UPDATE', 'SUPPLIER_DELETED'];
        const userTypes = ['USER_DELETED', 'USER_ADDED', 'ROLE_CHANGED'];
        const quoteTypes = ['QUOTE_RECEIVED'];

        if (inventoryTypes.includes(type)) return 'Inventory';
        if (supplierTypes.includes(type)) return 'Suppliers';
        if (userTypes.includes(type)) return 'Users';
        if (quoteTypes.includes(type)) return 'Quotes';
        return 'Other';
    }

    async markAsRead(event: Event, notification: Notification) {
        event.stopPropagation();
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });
    
            const params = {
                FunctionName: 'readNotification',
                Payload: new TextEncoder().encode(JSON.stringify({
                    body: JSON.stringify({
                        tenentId: this.tenentId,
                        notificationId: notification.notificationId
                    })
                })),
            };
    
            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    
            if (payload.statusCode === 200) {
                notification.isRead = true;
                this.updateFilteredNotifications();
            } else {
                throw new Error(payload.body || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });
    
            const params = {
                FunctionName: 'readNotification',
                Payload: new TextEncoder().encode(JSON.stringify({
                    body: JSON.stringify({
                        tenentId: this.tenentId,
                        markAllAsRead: true
                    })
                })),
            };
    
            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    
            if (payload.statusCode === 200) {
                this.notifications.forEach(notification => {
                    notification.isRead = true;
                });
                this.updateFilteredNotifications();
            } else {
                throw new Error(payload.body || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
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

    async saveNotificationSettings() {
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const params = {
                FunctionName: 'saveNotificationSettings', // Replace with your actual Lambda function name
                Payload: new TextEncoder().encode(JSON.stringify({
                    tenentId: this.tenentId,
                    settings: this.notificationSettings
                })),
            };

            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            const payload = JSON.parse(new TextDecoder().decode(response.Payload));

            if (payload.statusCode !== 200) {
                throw new Error(payload.body || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }

    getNotificationIcon(type: string): string {
        switch (this.getNotificationCategory(type)) {
            case 'Inventory': return 'inventory';
            case 'Suppliers': return 'business';
            case 'Users': return 'people';
            case 'Quotes': return 'request_quote';
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
        if (!notification.isRead) {
            this.markAsRead(new Event('click'), notification);
        }
        console.log('Notification clicked:', notification);
        // TODO: Implement navigation or action based on notification type
    }

    formatNotificationType(type: string): string {
        // Replace underscores with spaces and capitalize the first letter of each word
        return type.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    }
}