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

    constructor(public authenticator: AuthenticatorService, public loader: LoadingService, private themeService: ThemeService, private router: Router) {
        // Amplify.configure(outputs);
        this.loadTheme();
    }

    ngOnInit() {
        this.logAuthSession();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.isSupplierForm = event.url === '/supplier-form';
            }
        });
    }

    //

    toggleTheme(): void {
        const newTheme = this.themeService.getTheme() === 'dark' ? 'light' : 'dark';
        this.themeService.setTheme(newTheme);
    }

    loadTheme(): void {
        this.themeService.setTheme(this.themeService.getTheme());
    }

    //

    async logAuthSession() {
        try {
            const session = await fetchAuthSession();
            console.log(session);
        } catch (error) {
            console.error('Error fetching auth session:', error);
        }
    }
}
