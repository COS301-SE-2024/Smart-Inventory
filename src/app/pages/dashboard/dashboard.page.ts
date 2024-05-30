import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  userName: string = 'John Doe'; // Example user name
  userRole: string = 'Admin'; // Example user role

  constructor() { }

  ngOnInit() {
  }

  showUserProfile() {
    // Logic to show user profile
    console.log('User profile clicked');
  }
}


