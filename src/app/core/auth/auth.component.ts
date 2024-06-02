import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Import Router
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../../../amplify_outputs.json';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [AmplifyAuthenticatorModule], // Note: RouterOutlet should be Router if you're injecting it
})
export class AuthComponent {
  title = 'Smart-Inventory';

  constructor(
    public authenticator: AuthenticatorService,
    private router: Router  // Inject the Router
  ) {
    Amplify.configure(outputs);
  }

  signIn() {
    // Example of a signIn method with Amplify
    // this.authenticator.signIn().then(() => {
      // Navigate to the dashboard upon successful sign-in
      this.router.navigate(['/dashboard']);
  //   }).catch(error => {
  //     console.error('Sign-in failed:', error);
  //     // Handle errors here
  //   });
  }
}
