import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import { LoaderComponent } from './components/loader/loader.component';
import outputs from '../../amplify_outputs.json';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { GridComponent } from './components/grid/grid.component';
import { LoadingService } from './components/loader/loading.service';
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SecureDataService } from './services/secure-data.service';

Amplify.configure(outputs);

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [
        RouterOutlet,
        GridComponent,
        AmplifyAuthenticatorModule,
        SidebarComponent,
        HeaderComponent,
        LoaderComponent,
        CommonModule,
    ],
})
export class AppComponent implements OnInit {
    title = 'Smart-Inventory';
    sidebarCollapsed = false;
    isSupplierForm = false;
    isLandingPage = false;

    constructor(
        public authenticator: AuthenticatorService,
        public loader: LoadingService,
        private themeService: ThemeService,
        private router: Router,
        private secureDataService: SecureDataService
    ) { }

    async ngOnInit() {
        await this.logAuthSession();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.isSupplierForm = event.urlAfterRedirects.startsWith('/supplier-form');
            this.isLandingPage = event.urlAfterRedirects === '/landing' || event.urlAfterRedirects === '/';
        });

        // Example of using SecureDataService
        const accessToken = await this.secureDataService.getSecureItem('accessToken');
        if (accessToken) {
            console.log('Access token retrieved securely');
            // Use the access token as needed
        }
    }

    async logAuthSession() {
        try {
            const session = await fetchAuthSession();
            // Store session information securely
            await this.secureDataService.setSecureItem('authSession', JSON.stringify(session));
        } catch (error) {
            console.error('Error fetching auth session:', error);
        }
    }

    // Add methods to securely get and set data as needed
    async getSecureAuthSession() {
        const sessionString = await this.secureDataService.getSecureItem('authSession');
        return sessionString ? JSON.parse(sessionString) : null;
    }
}