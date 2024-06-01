import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  userName: string;
  userRole: string;

  navItems = ['General', 'Preferences', 'Notifications', 'User Permissions', 'Account'];
  selectedNavItem = this.navItems[0];

  darkMode: boolean = false;

  constructor() { 
    this.userName = "John";
    this.userRole = "Admin";
  }

  ngOnInit() {

  }

  showUserProfile(){
    console.log("User Profile: ", this.userName, this.userRole);
  }

  selectNavItem(item: string) {
    this.selectedNavItem = item;
  }

  onSave() { 

  }
  
  onCancel() {

  }

}
