import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { signOut } from 'aws-amplify/auth';
import { Router, RouterLink } from '@angular/router';
import { TitleService } from './title.service';
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationsSidePaneComponent } from '../notifications-side-pane/notifications-side-pane.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, MaterialModule, MatMenuModule, NotificationsSidePaneComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
    pageTitle: string = '';
    userName: string = '';
    userEmail: string = '';
    isNotificationPanelOpen: boolean = false;
    unreadCount: number = 0;

    constructor(
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private auth: AuthenticatorService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.titleService.currentTitle.subscribe((title) => (this.pageTitle = title));
        this.loadUserInfo();
    }

    loadUserInfo() {
        this.cognitoService.getCurrentUserAttributes().subscribe(
            (attributes) => {
                this.userName = `${attributes['given_name'] || ''} ${attributes['family_name'] || ''}`.trim();
                this.userEmail = attributes['email'] || '';
            },
            (error) => {
                console.error('Error loading user info:', error);
            },
        );
    }

    async logout() {
        try {
            await signOut();
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    toggleNotificationPanel() {
        this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    }

    onClosePanel() {
        this.isNotificationPanelOpen = false;
    }

    updateUnreadCount(count: number) {
        this.unreadCount = count;
    }
}
