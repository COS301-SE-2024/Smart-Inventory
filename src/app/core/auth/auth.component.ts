import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AmplifyAuthenticatorModule,
  AuthenticatorService,
} from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../../../amplify_outputs.json';
@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [RouterOutlet, AmplifyAuthenticatorModule],
})
export class AuthComponent {
  title = 'Smart-Inventory';
  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs);
  }
}
