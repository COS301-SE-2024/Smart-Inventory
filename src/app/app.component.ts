import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { FormsModule } from '@angular/forms';

Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, AmplifyAuthenticatorModule, FormsModule],
})
export class AppComponent {
  title = 'Smart-Inventory';
  user = {
    name: '',
    surname: '',
    email: '',
    role: ''
  };

  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs);
  }

  onSubmit() {
    // Handle form submission logic here
    console.log(this.user);
  }
}