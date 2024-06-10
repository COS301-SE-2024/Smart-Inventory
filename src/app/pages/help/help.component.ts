import { Component, OnInit } from '@angular/core';
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

interface MenuItem {
  title: string;
  content: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface TroubleshootingIssue {
  title: string;
  description: string;
}

@Component({
  selector: 'app-help',
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
    MatListModule
  ],

  templateUrl: './help.component.html',
  styleUrl: './help.component.css'
})
export class HelpComponent implements OnInit {
  menuItems: MenuItem[] = [
    { title: 'FAQs', content: ' ' },
    { title: 'User Guides', content: 'User Guides content...' },
    { title: 'Troubleshooting', content: ' ' },
    { title: 'Contact Support', content: ' ' },
    { title: 'Release Notes', content: ' ' },
  ];

  faqFilters: string[] = ['General', 'Account Management', 'Inventory Management', 'Notifications', 'User Permissions'];

  faqs: FAQ[] = [
    {
      question: 'How to reset my password?',
      answer: 'To reset your password, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
      category: 'Account Management'
    },
    {
      question: 'How to manage inventory?',
      answer: 'To manage inventory, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
      category: 'Inventory Management'
    },
    {
      question: 'How to enable notifications?',
      answer: 'To enable notifications, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
      category: 'Notifications'
    },
    {
      question: 'How to reset my password?',
      answer: 'To reset your password, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
      category: 'Account Management'
    },
    {
      question: 'How to manage inventory?',
      answer: 'To manage inventory, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
      category: 'Inventory Management'
    },
    {
      question: 'How to enable notifications?',
      answer: 'To enable notifications, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
      category: 'Notifications'
    },
    // Add more FAQs here
  ];

  troubleshootingIssues: TroubleshootingIssue[] = [
    {
      title: 'Login Issues and Password Reset',
      description: 'Description for Login Issues and Password Reset...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'
    },
    {
      title: 'Notification Issues and Configuration',
      description: 'Description for Notification Issues and Configuration...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'
    },
    {
      title: 'Stock Level Errors',
      description: 'Description for Stock Level Errors...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'
    },
    {
      title: 'Error Codes',
      description: 'Description for Error Codes...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'
    }
  ];


  filteredFaqs: FAQ[] = [];
  selectedMenuItem: MenuItem | null = null;
  selectedContent: string = '';
  isLightMode: boolean = true;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.onItemSelected(this.menuItems[0]); // Select FAQs by default
    this.filteredFaqs = this.faqs; // Show all FAQs by default
  }

  onProfileClick() {
    console.log('Profile clicked');
  }

  onItemSelected(item: MenuItem) {
    this.selectedMenuItem = item;
    this.selectedContent = item.content;
    if (item.title === 'FAQs') {
      this.filteredFaqs = this.faqs; // Reset filter when switching back to FAQs
    }
  }

  onSave() {
    this.snackBar.open('Changes saved successfully', 'Close', {
      duration: 2000,
    });
  }

  onCancel() {
    this.snackBar.open('Changes not saved', 'Close', {
      duration: 2000,
    });
  }

  toggleMode() {
    this.isLightMode = !this.isLightMode;
  }

  onFilterClick(filter: string) {
    this.filteredFaqs = this.faqs.filter(faq => faq.category === filter);
  }

  onSend() {
    // Handle the send button click event
    console.log('Send button clicked');
  }
}
