import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

interface MenuItem {
  title: string;
  content: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    FormsModule,
    MatExpansionModule,
    MatListModule,
    MatSelectModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  selectedMenuItem: MenuItem | null = null;
  selectedContent: string = '';
  currentTheme = "light";
  // isLightMode: boolean = true;
  // activeSection: string = '';
  timeZones = ['GMT', 'UTC', 'EST', 'PST']; // Example time zones
  languages = ['English', 'Spanish', 'French', 'German']; // Example languages
  dateTimeFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']; // Example date and time formats

  constructor(private snackBar: MatSnackBar) {}

  // NAVIGATION MENU
  menuItems: MenuItem[] = [
    { title: 'General', content: ' ' },
    { title: 'Preferences', content: ' ' },
    { title: 'Notifications', content: ' ' },
    { title: 'Account', content: ' ' },
  ];

  // ON PAGE LOAD
  ngOnInit() {
    this.onItemSelected(this.menuItems[0]); // Select General by default
  }

  // NAVIGATION MENU
  onItemSelected(item: MenuItem) {
    this.selectedMenuItem = item;
    this.selectedContent = item.content;
  }

  // SAVE BUTTON
  onSave() {
    this.snackBar.open('Changes saved successfully', 'Close', {
      duration: 2000,
    });
  }

  // CANCEL BUTTON
  onCancel() {
    this.snackBar.open('Changes not saved', 'Close', {
      duration: 2000,
    });
  }

  // LIGHT AND DARK THEM IMAGE SELECTION
  selectTheme(theme: string) {
    this.currentTheme = theme;
    if (theme === 'light') {
      this.applyLightTheme();
    } else if (theme === 'dark') {
      this.applyDarkTheme();
    }
  }

  applyLightTheme() {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }

  applyDarkTheme() {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}
