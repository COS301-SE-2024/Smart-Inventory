// settings.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { Router } from '@angular/router';

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
    encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
    selectedMenuItem: MenuItem | null = null;
    selectedContent: string = '';
    currentTheme = 'light';
    timeZones = ['GMT', 'UTC', 'EST', 'PST'];
    languages = ['English', 'Spanish', 'French', 'German'];
    dateTimeFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private authenticator: AuthenticatorService,
        private router: Router
    ) {}

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

    notificationTypes = [
        { title: 'Email Notifications', enabled: false, frequency: '' },
        { title: 'SMS Notifications', enabled: false, frequency: '' },
        { title: 'Push Notifications', enabled: false, frequency: '' },
    ];

    notificationTriggers = [
        { title: 'Low Stock', enabled: false },
        { title: 'New Inventory Added', enabled: false },
        { title: 'Inventory Update', enabled: false },
    ];

    isChangePasswordVisible = false;
    isDeleteAccountVisible = false;
    changePasswordText = 'Change Password';

    menuItems: MenuItem[] = [
        { title: 'Notifications', content: ' ' },
        { title: 'Account', content: ' ' },
    ];

    ngOnInit() {
        this.onItemSelected(this.menuItems[0]);
        this.titleService.updateTitle('Settings');
    }

    toggleNotification(type: any) {
        if (!type.enabled) {
            type.frequency = '';
        }
    }

    toggleChangePassword() {
        this.isChangePasswordVisible = !this.isChangePasswordVisible;
        this.changePasswordText = this.isChangePasswordVisible ? 'Save Password' : 'Change Password';
    }

    cancelChangePassword() {
        this.isChangePasswordVisible = false;
        this.changePasswordText = 'Change Password';
        this.password.current = '';
        this.password.new = '';
    }

    toggleDeleteAccount() {
        this.isDeleteAccountVisible = !this.isDeleteAccountVisible;
    }

    confirmDeleteAccount() {
        alert('Account deletion confirmed');
        this.isDeleteAccountVisible = false;
    }

    onItemSelected(item: MenuItem) {
        this.selectedMenuItem = item;
        this.selectedContent = item.content;
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

    applyLightTheme() {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }

    applyDarkTheme() {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    isLightMode = true;

    toggleMode(event: any) {
        this.isLightMode = event.checked;
        if (this.isLightMode) {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        }
    }

    selectTheme(theme: string) {
        this.currentTheme = theme;
        if (theme === 'dark') {
            this.isLightMode = true;
            this.applyLightTheme();
        } else if (theme === 'light') {
            this.isLightMode = false;
            this.applyDarkTheme();
        }
    }

    async handleResetPassword() {
        if (!this.password.current || !this.password.new) {
            this.snackBar.open('Please fill in all password fields', 'Close', { duration: 3000 });
            return;
        }

        try {
            await this.cognitoService.changePassword(this.password.current, this.password.new).toPromise();
            this.snackBar.open('Password reset successful. Please sign in again with your new password.', 'Close', { duration: 5000 });
            await this.authenticator.signOut();
        } catch (error) {
            console.error('Error resetting password:', error);
            this.snackBar.open('Error resetting password. Please try again.', 'Close', { duration: 3000 });
        }
    }

    async handleDeleteAccount() {
        if (!this.password.currentDelete || !this.profile.confirmEmailDelete) {
            this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
            return;
        }

        if (this.profile.confirmEmailDelete !== this.profile.email) {
            this.snackBar.open('Confirmation email does not match your email', 'Close', { duration: 3000 });
            return;
        }

        try {
            // First, verify the current password
            const isPasswordValid = await this.cognitoService.verifyCurrentPassword(this.profile.email, this.password.currentDelete).toPromise();
            
            if (!isPasswordValid) {
                this.snackBar.open('Current password is incorrect', 'Close', { duration: 3000 });
                return;
            }

            // If password is valid, proceed with account deletion
            await this.cognitoService.deleteAccount().toPromise();
            this.snackBar.open('Your account has been deleted successfully', 'Close', { duration: 5000 });
            await this.authenticator.signOut();
            this.router.navigate(['/login']); // Adjust this route as needed
        } catch (error) {
            console.error('Error deleting account:', error);
            this.snackBar.open('Error deleting account. Please try again.', 'Close', { duration: 3000 });
        }
    }
}