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
import { ContactSupportComponent } from 'app/components/contact-support/contact-support.component';

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
        ContactSupportComponent,
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

    faqFilters: string[] = ['General', 'Dashboard', 'Inventory', 'Team', 'Suppliers', 'Orders', 'Reports'];

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
            question: 'What are the different user roles in Smart Inventory?',
            answer: 'Administrator: Has access to all features. Inventory Controller: Has access to almost all features except team management. End-User: Can only request stock from the inventory.',
            category: 'Team',
        },
        {
            question: 'How do I add widgets to my dashboard?',
            answer: 'Click the "Quick Actions" button at the top right of the dashboard. Select the type of widget you want to add (graphs, summaries, tables, or text boxes). The new widget will appear on your dashboard.',
            category: 'Dashboard',
        },
        {
            question: 'Can I rearrange the widgets on my dashboard?',
            answer: 'Yes, you can rearrange widgets by clicking and dragging them to your desired position.',
            category: 'Dashboard',
        },
        {
            question: 'How do I add a new item to the inventory?',
            answer: 'Click the "Quick Actions" button. Select "Add Item." Fill in the details in the pop-up window. Click "Save" or "Submit" to create the new entry.',
            category: 'Inventory',
        },
        {
            question: ' Can I edit inventory entries?',
            answer: ' Yes, to edit an entry: Double-click on the cell you want to change. Make your changes. Press Enter to finalize the changes.',
            category: 'Inventory',
        },
        {
            question: 'How do I export to Excel?',
            answer: 'Click the "Quick Actions" button. Select "Export Excel." The file will be downloaded to your device.',
            category: 'General',
        },
        {
            question: ' How do I create a new order?',
            answer: 'Click the "Quick Actions" button on the Orders page. Select "Create Order." Follow the prompts to input order details.',
            category: 'Orders',
        },
        {
            question: 'What types of reports are available?',
            answer: 'Inventory Report, Order Report, Supplier Report and Activity Report',
            category: 'Reports',
        },
        {
            question: 'How do I access these reports?',
            answer: 'Navigate to the Reports page from the sidebar. Click on "View Full Report" under the specific report you want to see.',
            category: 'Reports',
        },
        {
            question: 'How to request items?',
            answer: 'To request an inventory item on the inventory page, Firstly you must, left click on row that you want to request. Click the "Quick Actions" button. A dropdown menu will appear. Select "Request Item." This opens a pop-up window to verify your request action. Agree to the pop up now the entry should be requested and decremented.',
            category: 'Inventory',
        },
        {
            question: 'How to Sort and Filter table?',
            answer: 'Sort and Filter 1. To sort a column all a user has to do is click on the column heading of the column they want to sort according to. 2. The arrow will be visible so a user can be aware of if its ascending or descending order. 3. To filter the user must press on the filter icon that will be visible when hovering over the column heading and filter according to their choice.',
            category: 'General',
        },
        {
            question: 'How to Search and Select a table?',
            answer: 'Search and Select 1. The search and select options can be found in the top left side of the page above the table. 2. A user can search for and item by firstly selecting a column they would like to search. 3. Once they have selected the column from the drop-down they must enter what they would like to search for in the search bar.',
            category: 'General',
        },
        {
            question: 'What is the Order Report?',
            answer: 'Contains data and analytics pertaining to orders of the team and automated orders as well.',
            category: 'Reports',
        },
        {
            question: 'What is the Supplier Report?',
            answer: 'Contains data and analytics pertaining to suppliers of the team.',
            category: 'Reports',
        },
        {
            question: 'What is the Activity Report?',
            answer: ': Contains data and analytics pertaining to members of the team.',
            category: 'Reports',
        },
        {
            question: 'What is the Inventory Report?',
            answer: 'Contains data and analytics pertaining to inventory of the team.',
            category: 'Reports',
        },
        {
            question: 'How to send order quote to supplier?',
            answer: 'If the user wants to create an order quote for a specific supplier they should firstly locate the Quick Actions button. Once located click on the button. Then a drop down will appear below the button.Then they should select the "Create Order" option in the drop-down. This will open a pop up for the user to add details regarding the supplier they would like to send the quote to and the products they would like to order. Once filled in the user can create the order by clicking the submit button.',
            category: 'Orders',
        },
        {
            question: 'How to cancel an order?',
            answer: 'If the user wants to cancel an order to a  Supplier from the orders page they should firstly click on the order they would like to cancel. Once the row is highlighted in blue. Then the user should locate the Quick Actions button. Once located click on the button. Then a drop down will appear below the button. Then they should select the Cancel Order" option in the drop-down. This will open a pop up for the user to confirm the cancellation.',
            category: 'Orders',
        },
        {
            question: 'How to process that an order is delivered?',
            answer: 'If the user wants to mark an order as being delivered from the orders page they should firstly click on the order they would like to cancel. Once the row is highlighted in blue. Then the user should locate the Quick Actions button. Once located click on the button. Then a drop down will appear below the button Then they should select the "Mark as delivered" option in the drop-down. This will open a pop up for the user to confirm delivery. The user can cancel by clicking the yes button.',
            category: 'Orders',
        },
        {
            question: 'How to view the full quote of an order?',
            answer: 'If the user wants to view a full order quote as being delivered from the orders page they should firstly click on the order they would like to view. Once the row is highlighted in blue. Then the user should locate the Quick Actions button. Once located click on the button. Then a drop down will appear below the button. Then they should select the "View Quote" option in the drop-down. This will open a pop up showing the full quotes details.',
            category: 'Orders',
        },
        {
            question: 'How to change email template?',
            answer: 'If the user wants to change the email template for supplier communication for a specific supplier they should firstly locate the Quick Actions button. Once located click on the button. Then a drop down will appear below the button. Then they should select the "View Template" option in the drop-down. This will open a pop up for current template. The user can change the inputs. The user can now save or cancel the changes.',
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
        {
            title: 'Cannot see sidebar',
            description:
                'The sidebar might be collapsed. Look for a hamburger menu icon (usually three horizontal lines) at the top left of the page. Click this icon to expand the sidebar.',
        },
        {
            title: 'Dashboard widgets not loading',
            description:
                'Check your internet connection. If the problem persists, try refreshing the page. If widgets are still not appearing, use the Quick Actions button to add new widgets or contact support for further assistance.',
        },
        {
            title: 'Cannot sort or filter table columns',
            description:
                "Ensure you're clicking directly on the column header to sort. For filtering, hover over the column header to reveal the filter icon. If these actions aren't working, refresh the page and try again. If the issue persists, contact support.",
        },
        {
            title: 'Excel export not working',
            description:
                'Make sure you have a stable internet connection. Check if your browser is blocking downloads. Try using a different browser. If the problem continues, contact support.',
        },
        {
            title: 'Cannot view full report details',
            description:
                'Ensure you\'re clicking on the "View Full Report" button under the specific report you want to see. If the report doesn\'t load, check your internet connection and try refreshing the page. If issues persist, contact support.',
        },
        {
            title: 'Quick Actions button not responding',
            description:
                'Refresh the page and try again. If the button remains unresponsive, try logging out and logging back in. If the problem continues, clear your browser cache and cookies, then retry. If issues persist, contact support.',
        },
        {
            title: 'Cannot change account settings',
            description:
                "Ensure you're logged in with the correct permissions. For changing passwords, make sure you're entering your current password correctly. If you're unable to save changes, check your internet connection and try again. For persistent issues, contact support.",
        },
        {
            title: 'Notification bell not showing new notifications',
            description:
                "Try refreshing the page. If notifications still don't appear, log out and log back in. If the problem persists, check your notification settings in your profile. If issues continue, contact support.",
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
