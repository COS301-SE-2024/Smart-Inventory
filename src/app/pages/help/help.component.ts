import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
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
import { TitleService } from '../../components/header/title.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

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
        MatListModule,
        MatGridListModule,
        MatCardModule,
        MatTabsModule,
    ],
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class HelpComponent implements OnInit {
    // NAVIGATION MENU
    menuItems: MenuItem[] = [
        { title: 'FAQs', content: ' ' },
        { title: 'Troubleshooting', content: ' ' },
        { title: 'User Guides', content: ' ' },
        { title: 'Contact Support', content: ' ' },
    ];

    faqFilters: string[] = ['General', 'Account Management', 'Inventory Management', 'Notifications'];

    faqs: FAQ[] = [
        {
            question: 'How to reset my password?',
            answer: 'To reset your password, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
            category: 'Account Management',
        },
        {
            question: 'How to manage inventory?',
            answer: 'To manage inventory, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
            category: 'Inventory Management',
        },
        {
            question: 'How to enable notifications?',
            answer: 'To enable notifications, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
            category: 'Notifications',
        },
        {
            question: 'How to reset my password?',
            answer: 'To reset your password, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
            category: 'Account Management',
        },
        {
            question: 'How to manage inventory?',
            answer: 'To manage inventory, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
            category: 'Inventory Management',
        },
        {
            question: 'How to enable notifications?',
            answer: 'To enable notifications, go to...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
            category: 'Notifications',
        },
    ];

    troubleshootingIssues: TroubleshootingIssue[] = [
        {
            title: 'Login Issues and Password Reset',
            description:
                'Description for Login Issues and Password Reset...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
        },
        {
            title: 'Notification Issues and Configuration',
            description:
                'Description for Notification Issues and Configuration...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
        },
        {
            title: 'Stock Level Errors',
            description:
                'Description for Stock Level Errors...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
        },
        {
            title: 'Error Codes',
            description:
                'Description for Error Codes...Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit',
        },
    ];

    filteredFaqs: FAQ[] = [];
    selectedMenuItem: MenuItem | null = null;
    selectedContent: string = '';
    activeSection: string = '';

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
    ) {}

    ngOnInit() {
        this.onItemSelected(this.menuItems[0]); // Select FAQs by default
        this.filteredFaqs = this.faqs; // Show all FAQs by default
        this.titleService.updateTitle('Help');
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

    // LIGHT AND DARK MODE TOGGLE

    // isLightMode: boolean = true;
    // toggleMode(event: any) {
    //     this.isLightMode = event.checked;
    //     if (this.isLightMode) {
    //         // Logic to switch to light mode
    //         document.body.classList.remove('dark-mode');
    //         document.body.classList.add('light-mode');
    //     } else {
    //         // Logic to switch to dark mode
    //         document.body.classList.remove('light-mode');
    //         document.body.classList.add('dark-mode');
    //     }
    // }

    onFilterClick(filter: string) {
        this.filteredFaqs = this.faqs.filter((faq) => faq.category === filter);
    }

    onSend() {
        // Handle the send button click event
        console.log('Send button clicked');
    }

    onContactSupport() {
        // Contact support logic
    }

    // USER GUIDES

    toggleSection(section: any) {
        section.expanded = !section.expanded;
    }

    scrollTo(id: string) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }

    navigateTo(event: Event, id: string) {
        event.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(event: Event) {
        const sections = document.querySelectorAll('.article-content h2, .article-content h3');
        let currentSection: string = '';

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                currentSection = section.id;
            }
        });

        this.activeSection = currentSection;
    }

    isActive(sectionId: string): boolean {
        return this.activeSection === sectionId;
    }
}
