import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

// Define the User interface here
interface User {
  siNo: number;
  name: string;
  username: string;
  mobile: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
// export class SettingsPage implements OnInit {
//   userName: string;
//   userRole: string;

//   navItems = ['General', 'Preferences', 'Notifications', 'User Permissions', 'Account'];
//   selectedNavItem = this.navItems[0];

//   darkMode: boolean = false;

//   imageUrl1: string = 'assets/images/light-mode.png';
//   imageUrl2: string = 'assets/images/light-mode.png';
//   selectedImage: number | null = null; // Explicitly declare as number or null

//   selectImage(imageNumber: number): void {
//     this.selectedImage = this.selectedImage === imageNumber ? null : imageNumber;
//   }

//   notification1: boolean = false;
//   notification2: boolean = false;
//   notification3: boolean = false;

//   mobileNumber: string = '';
//   zipCode: string = '';
//   passwordEditable: boolean = false;
//   showPassword: boolean = false;

//   currentPage: number = 1;
//   totalPages: number = 1;

//   users: User[] = [
//     { siNo: 1, name: 'John Doe', username: 'johndoe', mobile: '123456789', role: 'Employee', status: 'Active' },
//     { siNo: 2, name: 'Jane Smith', username: 'janesmith', mobile: '987654321', role: 'Inventory Controller', status: 'Disabled' },
//     // Add more user objects as needed
//   ];

//   constructor(private themeService: ThemeService) {
//     this.userName = "John";
//     this.userRole = "Admin";
//   }

//   isLightTheme: boolean = true;
//   selectedTheme: string;

//   ngOnInit() { 
//     const theme = localStorage.getItem('appTheme') || 'light';
//     this.isLightTheme = theme === 'light';
//     this.selectedTheme = theme;
//   }

//   showUserProfile() {
//     console.log("User Profile: ", this.userName, this.userRole);
//   }

//   selectNavItem(item: string) {
//     this.selectedNavItem = item;
//   }

//   onSave() { }

//   ////////////////////////////////////////////////////////////////////////////
//   // selectedTheme: 'light' | 'dark' = 'dark'; // Default to 'dark'

//   // selectTheme(theme: 'light' | 'dark') {
//   //   this.selectedTheme = theme;
//   //   // Additional logic to actually change the theme if applicable
//   //   console.log('Theme selected:', theme);
//   // }

//   selectTheme(theme: string) {
//     this.selectedTheme = theme;
//     this.isLightTheme = theme === 'light';
//     this.themeService.setAppTheme(theme);
//   }

//   toggleTheme() {
//     this.isLightTheme = !this.isLightTheme;
//     this.selectedTheme = this.isLightTheme ? 'light' : 'dark';
//     this.themeService.setAppTheme(this.selectedTheme);
//   }

//   /////////////////////////////////////////////////////////////////////////////

//   onCancel() { }

//   validateMobileNumber(event: any) {
//     const regex = /^\(\+27\) \d{2} \d{3} \d{4}$/;
//     if (!regex.test(event)) {
//       // Handle invalid mobile number
//       console.log('Invalid mobile number');
//     } else {
//       this.mobileNumber = event;
//     }
//   }

//   validateZipCode(event: any) {
//     const regex = /^\d{4}$/;
//     if (!regex.test(event)) {
//       // Handle invalid zip code
//       console.log('Invalid zip code');
//     } else {
//       this.zipCode = event;
//     }
//   }

//   togglePasswordEditable() {
//     this.passwordEditable = !this.passwordEditable;
//   }

//   viewNotifications() {
//     // Implement view notifications logic
//   }

//   showProfileDropdown() {
//     // Implement show profile dropdown logic
//   }

//   addUser() {
//     // Implement add user logic
//   }

//   editUser(user: User) {
//     // Implement edit user logic
//   }

//   prevPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//     }
//   }

//   lastPage() {
//     this.currentPage = this.totalPages;
//   }
// }

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

  notification1: boolean = false;
  notification2: boolean = false;
  notification3: boolean = false;

  mobileNumber: string = '';
  zipCode: string = '';
  passwordEditable: boolean = false;
  showPassword: boolean = false;

  currentPage: number = 1;
  totalPages: number = 1;

  users: User[] = [
    { siNo: 1, name: 'John Doe', username: 'johndoe', mobile: '123456789', role: 'Employee', status: 'Active' },
    { siNo: 2, name: 'Jane Smith', username: 'janesmith', mobile: '987654321', role: 'Inventory Controller', status: 'Disabled' },
    // Add more user objects as needed
  ];

  constructor(private themeService: ThemeService) {
    this.userName = "John";
    this.userRole = "Admin";
    this.selectedTheme = localStorage.getItem('appTheme') || 'light'; // Initialize selectedTheme here
  }

  isLightTheme: boolean = true;
  selectedTheme: string;

  ngOnInit() { 
    const theme = localStorage.getItem('appTheme') || 'light';
    this.isLightTheme = theme === 'light';
    this.selectedTheme = theme;
  }

  showUserProfile() {
    console.log("User Profile: ", this.userName, this.userRole);
  }

  selectNavItem(item: string) {
    this.selectedNavItem = item;
  }

  onSave() { }

  selectTheme(theme: string) {
    this.selectedTheme = theme;
    this.isLightTheme = theme === 'light';
    this.themeService.setAppTheme(theme);
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    this.selectedTheme = this.isLightTheme ? 'light' : 'dark';
    this.themeService.setAppTheme(this.selectedTheme);
  }

  onCancel() { }

  validateMobileNumber(event: any) {
    const regex = /^\(\+27\) \d{2} \d{3} \d{4}$/;
    if (!regex.test(event)) {
      // Handle invalid mobile number
      console.log('Invalid mobile number');
    } else {
      this.mobileNumber = event;
    }
  }

  validateZipCode(event: any) {
    const regex = /^\d{4}$/;
    if (!regex.test(event)) {
      // Handle invalid zip code
      console.log('Invalid zip code');
    } else {
      this.zipCode = event;
    }
  }

  togglePasswordEditable() {
    this.passwordEditable = !this.passwordEditable;
  }

  viewNotifications() {
    // Implement view notifications logic
  }

  showProfileDropdown() {
    // Implement show profile dropdown logic
  }

  addUser() {
    // Implement add user logic
  }

  editUser(user: User) {
    // Implement edit user logic
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  lastPage() {
    this.currentPage = this.totalPages;
  }
}
