import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { Platform } from '@ionic/angular';
import { ThemeService } from '../services/theme.service';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
    private subscription: Subscription;
    showSidebar: boolean = false;
    title = 'Smart-Inventory';
    constructor(
        private router: Router,
        private platform: Platform,
        private themeService: ThemeService,
        public authenticator: AuthenticatorService
    ) {
        this.initializeApp();

        Amplify.configure(outputs);

        this.subscription = this.router.events.pipe(
            filter((event: any) => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.showSidebar = event.url !== '/';
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.themeService.loadAppTheme();
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

