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

  imageUrl1: string = 'assets/images/light-mode.png';
  imageUrl2: string = 'assets/images/light-mode.png';
  selectedImage: number | null = null; // Explicitly declare as number or null

  selectImage(imageNumber: number): void {
    this.selectedImage = this.selectedImage === imageNumber ? null : imageNumber;
  }  

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
