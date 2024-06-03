import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  userName: string;
  userRole: string;

  defaultAccordion = 'item1';

  darkMode: boolean = false;

  navItems = ['General', 'Preferences', 'Notifications', 'User Permissions', 'Account'];
  selectedNavItem = this.navItems[0];

  constructor() {
    this.userName = "John";
    this.userRole = "Admin";
  }

  ngOnInit() {

  }

  selectedTheme: 'light' | 'dark' = 'dark'; // Default to 'dark'

  selectTheme(theme: 'light' | 'dark') {
    this.selectedTheme = theme;
    // Additional logic to actually change the theme if applicable
    console.log('Theme selected:', theme);
  }


  showUserProfile() {
    console.log("User Profile: ", this.userName, this.userRole);
  }

  selectNavItem(item: string) {
    this.selectedNavItem = item;
  }

  onSave() {

  }

  contactSupport() {
    // Logic to handle contact support action
    console.log('Redirecting to contact support...');
    // You can redirect to a contact page or open a modal/chat window here
  }


  onCancel() {

  }

}
