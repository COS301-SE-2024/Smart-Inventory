import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-overhaul',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-overhaul.component.html',
  styleUrls: ['./settings-overhaul.component.css']
})
export class SettingsOverhaulComponent {
  personalDetails = {
    name: '',
    surname: '',
    email: ''
  };

  passwordChange = {
    current: '',
    new: ''
  };

  savePersonalDetails() {
    console.log('Saving personal details:', this.personalDetails);
    // Implement the logic to save personal details
  }

  updatePassword() {
    console.log('Updating password');
    // Implement the logic to update password
  }

  editEmailTemplate() {
    console.log('Editing email template');
    // Implement the logic to edit email template
  }

  editAutomationTemplates() {
    console.log('Editing automation templates');
    // Implement the logic to edit automation templates
  }

  editDeliveryInfo() {
    console.log('Editing delivery information');
    // Implement the logic to edit delivery information
  }

  changeTheme() {
    console.log('Customizing app appearance');
    // Implement the logic to customize app appearance
  }
}