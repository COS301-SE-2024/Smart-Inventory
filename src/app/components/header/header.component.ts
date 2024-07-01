import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { TitleService } from './title.service';
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [MaterialModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
    pageTitle: string = '';
    userName: string = '';
    userEmail: string = '';

    constructor(
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private auth: AuthenticatorService,
        private router: Router
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
            }
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
}
