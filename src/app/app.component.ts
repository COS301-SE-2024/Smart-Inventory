import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { fetchAuthSession } from 'aws-amplify/auth';

Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, AmplifyAuthenticatorModule],
})
export class AppComponent implements OnInit {
  title = 'Smart-Inventory';

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