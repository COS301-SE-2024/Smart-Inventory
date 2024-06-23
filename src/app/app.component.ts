import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import { LoaderComponent } from './components/loader/loader.component';
import outputs from '../../amplify_outputs.json';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { GridComponent } from './components/grid/grid.component';
import { LoadingService } from './components/loader/loading.service';
Amplify.configure(outputs);
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, GridComponent, AmplifyAuthenticatorModule, SidebarComponent, HeaderComponent, LoaderComponent],
})
export class AppComponent implements OnInit {
    title = 'Smart-Inventory';
    sidebarCollapsed = false;

  constructor(public authenticator: AuthenticatorService, public loader: LoadingService) {
    // Amplify.configure(outputs);
  }

    ngOnInit() {
        this.logAuthSession();
    }

    async logAuthSession() {
        try {
            const session = await fetchAuthSession();
            console.log(session);
        } catch (error) {
            console.error('Error fetching auth session:', error);
        }
    }
}
