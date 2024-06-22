import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { signOut } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { TitleService } from './title.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  pageTitle: string = '';
  user: string = 'John Doe';

  ngOnInit() {
    this.titleService.currentTitle.subscribe(title => {
      this.pageTitle = title;
    });
  }
  constructor(private router: Router, private titleService: TitleService) {}

  async logout() {
    try {
      await signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
