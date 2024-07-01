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

    faqFilters: string[] = ['General', 'Dashboard', 'Inventory', 'Team', 'Suppliers', 'Orders'];

    faqs: FAQ[] = [
        {
            question: 'How to reset my password?',
            answer: 'To reset your password, navigate to settings in profile you will see change password under the password section. Click on the "Change Password" button and fill the required details to change your password.',
            category: 'General',
        },
        {
            question: 'How remember my password on sign in?',
            answer: 'To remember a forgotten password, is currently not possible but you can replace it with a new password. Navigate to login page by logging out and clicking forget password and you will receive an email with verification code to change it.',
            category: 'General',
        },
        {
            question: 'How to change my email?',
            answer: 'To change your email, navigate to settings in profile you will see email under "Details" section. Click on the "Change Email" button and fill the required details to change your email.',
            category: 'General',
        },
        {
            question: 'How to change my name?',
            answer: 'To change your name, navigate to settings in profile you will see name input box under "Details" section. Click on the type in the new name to change your name.',
            category: 'General',
        },
        {
            question: 'How to add inventory?',
            answer: 'To add an inventory item on the inventory page, click the "Quick Actions" button and a dropdown menu will appear Select "Add Item" opening a pop-up window. Fill in the details. The pop-up will display all relevant column names alongside input boxes. Enter the necessary information for each field. Click submit. Once you have filled in the details, complete the action to create the new entry. This might involve a button labeled "Save," "Submit," or something similar.',
            category: 'Inventory',
        },
        {
            question: 'How to remove inventory?',
            answer: 'To remove an inventory item on the inventory page, Firstly you must, left click on row that you want to remove. Click the "Quick Actions" button. A dropdown menu will appear. Select "Remove Item." This opens a pop-up window to verify your delete action. Agree to the pop up now the entry should be removed.',
            category: 'Inventory',
        },
        {
            question: 'How to edit inventory?',
            answer: 'To edit an inventory item on the inventory page, To edit any entry in the able it is as simple as double clicking on the cell you want to change. When you have finished editing the cells you press enter to finalize the changes.',
            category: 'Inventory',
        },
        {
            question: 'How to move widget?',
            answer: 'To move a widget on dashboard page, You can customize position of each widget by dragging and dropping, click and hold a widget, then drag it to a new location on the dashboard to rearrange the layout for better visibility or workflow.',
            category: 'Dashboard',
        },
        {
            question: 'How to add widget?',
            answer: 'To add a widget to the dashboard page, click the "Quick Actions" button in which will give you a drop down menu, now choose the "add widget" menu option. Choose select the type of widget you want and it should place it at the bottom of the page.',
            category: 'Dashboard',
        },
        {
            question: 'How to remove widget?',
            answer: 'To remove a widget inventory, click on a widget and while highlighted click on quick actions and choose the delete option.',
            category: 'Dashboard',
        },
        {
            question: 'How to add member to my team?',
            answer: 'To add member to my team on the team page,  click the "Quick Actions" button and a dropdown menu will appear Select "Add Member" opening a pop-up window. Fill in the details. The pop-up will display all relevant column names alongside input boxes. Enter the necessary information for each field. Click submit. Once you have filled in the details, complete the action to create the new entry. This might involve a button labeled "Save," "Submit," or something similar.',
            category: 'Team',
        },
        {
            question: 'How to remove member from my team?',
            answer: 'To remove a member from my team on the team page, select the delete in the corresponding row of the person you want to remove. It will ask you if you are sure just click yes.',
            category: 'Team',
        },
        {
            question: 'How to edit member of my teams details?',
            answer: 'To edit a member of my team on the team page, To edit any entry in the able it is as simple as double clicking on the cell you want to change. When you have finished editing the cells you press enter to finalize the changes.',
            category: 'Team',
        },
        {
            question: 'How to add a supplier?',
            answer: 'To add a supplier to supplier page, click the "Quick Actions" button and a dropdown menu will appear Select "Add Supplier" opening a pop-up window. Fill in the details. The pop-up will display all relevant column names alongside input boxes. Enter the necessary information for each field. Click submit. Once you have filled in the details, complete the action to create the new entry. This might involve a button labeled "Save," "Submit," or something similar.',
            category: 'Suppliers',
        },
        {
            question: 'How to remove a supplier?',
            answer: 'To remove a supplier from supplier page, Firstly you must, left click on row that you want to remove. Click the "Quick Actions" button. A dropdown menu will appear. Select "Remove Item." This opens a pop-up window to verify your delete action. Agree to the pop up now the entry should be removed.',
            category: 'Suppliers',
        },
        {
            question: 'How to edit supplier details?',
            answer: 'To edit supplier details on suppliers page, To edit any entry in the able it is as simple as double clicking on the cell you want to change. When you have finished editing the cells you press enter to finalize the changes.',
            category: 'Suppliers',
        },
        {
            question: 'How to cancel orders?',
            answer: 'To enable orders page,',
            category: 'Orders',
        },
    ];

    troubleshootingIssues: TroubleshootingIssue[] = [
        {
            title: 'Cannot login',
            description:
                'Firstly make sure you have a good network connection. Then make sure that you are providing the correct details and that the password is correct. If you are sure your details are correct and it still tells you your password is incorrect click on forgot password. If you are still having issues please contact us.',
        },
        {
            title: 'Forget password verification code not sent',
            description:
                'If the current screen says a code has been sent. Check that you are looking at the correct email that it would send it to. Also check that you have internet connection. If it is still not there ask to resend the code by clicking on "resend code". If you are still having issues please contact us.',
        },
        {
            title: 'Cannot create an account',
            description:
                'If you have been provided with a login link there is no need to create an account as your admin created your account you only need to verify your password with your email. If you are an admin and cannot create an account check that if you have already created one you are not using the same email. Any further issues please contact us.',
        },
        {
            title: 'Cannot add or remove from tables',
            description:
                'Firstly if you are and End-User you have no ability to do so. If you are an Inventory controller or admin you should be able to check that you are using the functionality correctly, to find out about functionality go to FAQ or User Guides. Any other issues please contact us.',
        },
        {
            title: 'Cannot add or remove team member',
            description:
                'Firstly if you are an End-User or Inventory controller you have no ability to do so. If you are an admin you should be able to check that you are using the functionality correctly, to find out about functionality go to FAQ or User Guides. Any other issues please contact us.',
        },
        {
            title: 'Error Codes',
            description: '404: Server is down or not found',
        },
        {
            title: 'Bugs',
            description: 'If you have identified a bug please do contact us so we can fix it.',
        },
    ];

    filteredFaqs: FAQ[] = [];
    selectedMenuItem: MenuItem | null = null;
    selectedContent: string = '';
    activeSection: string = '';

    constructor(private snackBar: MatSnackBar, private titleService: TitleService) {}

    ngOnInit() {
        this.onItemSelected(this.menuItems[0]); // Select FAQs by default
        this.filteredFaqs = this.faqs; // Show all FAQs by default
        this.titleService.updateTitle('Help');
    }

    renameTitle(t: string) {
        this.titleService.updateTitle('Help > ' + t);
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
