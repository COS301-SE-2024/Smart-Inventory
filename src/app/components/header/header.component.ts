import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { TitleService } from './title.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  pageTitle: string = '';
  userName: string = '';
  userEmail: string = '';

  constructor(private router: Router, private titleService: TitleService) {}

  async ngOnInit() {
    this.titleService.currentTitle.subscribe(title => {
      this.pageTitle = title;
    });

    try {
      const userAttributes = await fetchUserAttributes();
      this.userName = `${userAttributes.given_name || ''} ${userAttributes.family_name || ''}`.trim();
      this.userEmail = userAttributes.email || '';
    } catch (error) {
      console.error('Error fetching user attributes:', error);
    }
  }

  async logout() {
    try {
      await signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}