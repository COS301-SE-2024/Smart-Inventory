import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TitleService } from '../../components/header/title.service';
import { MatGridListModule } from '@angular/material/grid-list';

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
        MatSelectModule,
        MatTabsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatCheckboxModule,
        MatGridListModule,
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css',
    encapsulation: ViewEncapsulation.None, // Add this line
})
export class SettingsComponent {
    selectedMenuItem: MenuItem | null = null;
    selectedContent: string = '';
    currentTheme = 'light';
    timeZones = ['GMT', 'UTC', 'EST', 'PST']; // Example time zones
    languages = ['English', 'Spanish', 'French', 'German']; // Example languages
    dateTimeFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']; // Example date and time formats

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
    ) {}

    // ACCOUNT SECTION

    profile = {
        name: '',
        surname: '',
        email: '',
        mobile: '',
        country: '',
        province: '',
        city: '',
        street: '',
        unitNumber: '',
        zipCode: '',
        confirmEmail: '',
        confirmEmailDelete: '',
    };

    password = {
        current: '',
        new: '',
        currentDelete: '',
    };

    countries = ['Country 1', 'Country 2', 'Country 3'];
    provinces = ['Province 1', 'Province 2', 'Province 3'];
    cities = ['City 1', 'City 2', 'City 3'];

    emailFormControl = new FormControl('', [Validators.required, Validators.email]);
    mobileFormControl = new FormControl('', [Validators.pattern('\\(\\+27\\) \\d{2} \\d{3} \\d{4}')]);

    // NOTIFICATIONS
    notificationTypes = [
        { title: 'Email Notifications', enabled: false, frequency: '' },
        { title: 'SMS Notifications', enabled: false, frequency: '' },
        { title: 'Push Notifications', enabled: false, frequency: '' },
    ];

    notificationTriggers = [
        { title: 'Low Stock', enabled: false },
        { title: 'New Inventory Added', enabled: false },
        { title: 'Inventory Update', enabled: false },
        { title: 'Inventory Update', enabled: false },
    ];

    toggleNotification(type: any) {
        if (!type.enabled) {
            type.frequency = '';
        }
    }

    // CHANGE PASSWORD
    isChangePasswordVisible = false;
    isDeleteAccountVisible = false;
    changePasswordText = 'Change Password';

    toggleChangePassword() {
        this.isChangePasswordVisible = !this.isChangePasswordVisible;
        this.changePasswordText = this.isChangePasswordVisible ? 'Save Password' : 'Change Password';
    }

    cancelChangePassword() {
        this.isChangePasswordVisible = false;
        this.changePasswordText = 'Change Password';
    }

    // DELETE ACCOUNT
    toggleDeleteAccount() {
        this.isDeleteAccountVisible = !this.isDeleteAccountVisible;
    }

    confirmDeleteAccount() {
        // Add account deletion logic here
        alert('Account deletion confirmed');
        this.isDeleteAccountVisible = false;
    }

    // NAVIGATION MENU
    menuItems: MenuItem[] = [
        { title: 'Notifications', content: ' ' },
        { title: 'Account', content: ' ' },
    ];

    // ON PAGE LOAD
    ngOnInit() {
        this.onItemSelected(this.menuItems[0]); // Select General by default
        this.titleService.updateTitle('Settings');
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
    // selectTheme(theme: string) {
    //   this.currentTheme = theme;
    //   if (theme === 'light') {
    //     this.applyLightTheme();
    //   } else if (theme === 'dark') {
    //     this.applyDarkTheme();
    //   }
    // }

    applyLightTheme() {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }

    applyDarkTheme() {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    // LIGHT AND DARK MODE TOGGLE

    isLightMode = true; // Initial mode, set to true for Light Mode by default

    toggleMode(event: any) {
        this.isLightMode = event.checked;
        if (this.isLightMode) {
            // Logic to switch to light mode
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        } else {
            // Logic to switch to dark mode
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        }
    }

    selectTheme(theme: string) {
        this.currentTheme = theme;
        if (theme === 'dark') {
            this.isLightMode = true; // Update toggle state
            this.applyLightTheme();
        } else if (theme === 'light') {
            this.isLightMode = false; // Update toggle state
            this.applyDarkTheme();
        }
    }
}
