import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
    private subscription: Subscription;
    showSidebar: boolean = false;

    constructor(private router: Router) {
        this.subscription = this.router.events.pipe(
            filter((event: any) => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.showSidebar = event.url !== '/';
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}