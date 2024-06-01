import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  userName: string;
  userRole: string;

  navItems = ['General', 'Preferences', 'Notifications', 'User Permissions', 'Account'];
  selectedNavItem = this.navItems[0];

  constructor() {
    this.userName = "John";
    this.userRole = "Admin";
  }

  ngOnInit() {

  }

  showUserProfile() {
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
