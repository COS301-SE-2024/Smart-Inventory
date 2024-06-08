import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AmplifyAuthenticatorModule,
  AuthenticatorService,
} from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { GridComponent } from './components/grid/grid.component';
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
  ],
})
export class AppComponent implements OnInit {
  title = 'Smart-Inventory';
  sidebarCollapsed = false;

  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs);
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
