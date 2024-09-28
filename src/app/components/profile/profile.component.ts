import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { TitleService } from '../../components/header/title.service';
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from '../../services/theme.service';
import { DeliveryInformationModalComponent } from '../../components/delivery-information-modal/delivery-information-modal.component';
import { EmailTemplateModalComponent } from '../email-template-modal/email-template-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TemplatesQuotesSidePaneComponent } from 'app/components/templates-quotes-side-pane/templates-quotes-side-pane.component';
import { fetchAuthSession } from 'aws-amplify/auth';

interface DeliveryAddress {
    company: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    instructions: string;
    contactName: string;
    email: string;
    phone: string;
}
@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule,
        MatListModule,
        MatSelectModule,
        MatCardModule,
        MatToolbarModule,
        DeliveryInformationModalComponent,
        MatDialogModule,
        TemplatesQuotesSidePaneComponent,
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);
    isTemplateSidePaneOpen: boolean = false;
    private role: string = '';
    profile = {
        name: '',
        surname: '',
        email: '',
        confirmEmailDelete: '',
    };

    password = {
        current: '',
        new: '',
        currentDelete: '',
    };
    isChangingPassword = false;
    hidePassword = true;

    currentTheme = 'light';
    isDeleteAccountVisible = false;

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private authenticator: AuthenticatorService,
        private router: Router,
        private themeService: ThemeService,
        private dialog: MatDialog,
    ) {}

    viewEmailTemplate() {
        const dialogRef = this.dialog.open(EmailTemplateModalComponent, {
            width: '600px',
            data: { emailTemplate: this.getEmailTemplate() },
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.saveEmailTemplate(result);
            }
        });
    }

    viewTemplatesQuotes() {
        this.isTemplateSidePaneOpen = true;
    }

    getEmailTemplate() {
        // Implement logic to get the current email template
        // This could be from a service or local storage
        return {
            greeting: 'Dear Supplier,',
            explanation: 'We are requesting a quote for the following items:',
            items: '',
            requirements: 'Please provide your best price and delivery time for these items.',
            instructions: 'Submit your quote through our web form at [Your Web Form URL]',
            contactInfo: 'If you have any questions, please contact us at [Your Contact Information]',
        };
    }

    saveEmailTemplate(template: any) {
        // Implement logic to save the email template
        // This could be to a service or local storage
        console.log('Saving email template:', template);
    }
    deliveryAddress: DeliveryAddress = {
        company: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        instructions: '',
        contactName: '',
        email: '',
        phone: '',
    };

    viewDeliveryInfo() {
        const dialogRef = this.dialog.open(DeliveryInformationModalComponent, {
            width: '600px',
            data: { deliveryAddress: this.deliveryAddress },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deliveryAddress = result;
                this.saveDeliveryInfo(result);
            }
        });
    }

    saveDeliveryInfo(deliveryInfo: DeliveryAddress) {
        // Implement logic to save the delivery information
        // This could be to a service or API
        console.log('Saving delivery information:', deliveryInfo);
    }

    ngOnInit() {
        this.titleService.updateTitle('Settings');
        this.loadUserProfile();
        this.currentTheme = this.themeService.getTheme();
        this.logAuthSession();
    }

    async logAuthSession() {
        try {
            const session = await fetchAuthSession();
            this.role = '' + session.tokens?.idToken?.payload?.['cognito:groups']?.toString();
        } catch (error) {
            console.error('Error fetching auth session:', error);
        }
    }

    notEndUser() {
        return this.role == 'enduser';
    }

    loadUserProfile() {
        this.cognitoService.getCurrentUserAttributes().subscribe(
            (attributes) => {
                this.profile.name = attributes['given_name'] || '';
                this.profile.surname = attributes['family_name'] || '';
                this.profile.email = attributes['email'] || '';
                this.emailFormControl.setValue(this.profile.email);
            },
            (error) => {
                console.error('Error loading user profile:', error);
                this.snackBar.open('Error loading user profile', 'Close', { duration: 3000 });
            },
        );
    }

    saveProfileChanges() {
        const updatedAttributes: Record<string, string> = {
            ['given_name']: this.profile.name,
            ['family_name']: this.profile.surname,
            ['email']: this.profile.email,
        };

        if (this.emailFormControl.value) {
            updatedAttributes['email'] = this.emailFormControl.value;
        }

        this.cognitoService.updateUserAttribute(updatedAttributes).subscribe(
            (result) => {
                console.log('Update result:', result); // Log the result for debugging
                this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
            },
            (error) => {
                console.error('Error updating profile:', error);
                this.snackBar.open('Error updating profile. Please try again.', 'Close', { duration: 3000 });
            },
        );
    }

    handleResetPassword() {
        if (!this.password.current || !this.password.new) {
            this.snackBar.open('Please fill in all password fields', 'Close', { duration: 3000 });
            return;
        }

        this.cognitoService.changePassword(this.password.current, this.password.new).subscribe(
            () => {
                this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
                this.password.current = '';
                this.password.new = '';
            },
            (error) => {
                console.error('Error changing password:', error);
                this.snackBar.open('Error changing password. Please try again.', 'Close', { duration: 3000 });
            },
        );
    }

    toggleDeleteAccount() {
        this.isDeleteAccountVisible = !this.isDeleteAccountVisible;
    }

    handleDeleteAccount() {
        if (!this.password.currentDelete || !this.profile.confirmEmailDelete) {
            this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
            return;
        }

        if (this.profile.confirmEmailDelete !== this.profile.email) {
            this.snackBar.open('Confirmation email does not match your email', 'Close', { duration: 3000 });
            return;
        }

        this.cognitoService.verifyCurrentPassword(this.profile.email, this.password.currentDelete).subscribe(
            (isValid) => {
                if (isValid) {
                    this.cognitoService.deleteAccount().subscribe(
                        () => {
                            this.snackBar.open('Account deleted successfully', 'Close', { duration: 3000 });
                            this.authenticator.signOut();
                            this.router.navigate(['/login']);
                        },
                        (error) => {
                            console.error('Error deleting account:', error);
                            this.snackBar.open('Error deleting account. Please try again.', 'Close', {
                                duration: 3000,
                            });
                        },
                    );
                } else {
                    this.snackBar.open('Invalid password', 'Close', { duration: 3000 });
                }
            },
            (error) => {
                console.error('Error verifying password:', error);
                this.snackBar.open('Error verifying password. Please try again.', 'Close', { duration: 3000 });
            },
        );
    }

    // toggleDeleteAccount() {
    //     this.isDeleteAccountVisible = !this.isDeleteAccountVisible;
    // }

    // handleDeleteAccount() {
    //     if (!this.password.currentDelete || !this.profile.confirmEmailDelete) {
    //         this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
    //         return;
    //     }

    //     if (this.profile.confirmEmailDelete !== this.profile.email) {
    //         this.snackBar.open('Confirmation email does not match your email', 'Close', { duration: 3000 });
    //         return;
    //     }

    //     this.cognitoService.verifyCurrentPassword(this.profile.email, this.password.currentDelete).subscribe(
    //         (isValid) => {
    //             if (isValid) {
    //                 this.cognitoService.deleteAccount().subscribe(
    //                     () => {
    //                         this.snackBar.open('Account deleted successfully', 'Close', { duration: 3000 });
    //                         this.authenticator.signOut();
    //                         this.router.navigate(['/login']);
    //                     },
    //                     (error) => {
    //                         console.error('Error deleting account:', error);
    //                         this.snackBar.open('Error deleting account. Please try again.', 'Close', {
    //                             duration: 3000,
    //                         });
    //                     },
    //                 );
    //             } else {
    //                 this.snackBar.open('Invalid password', 'Close', { duration: 3000 });
    //             }
    //         },
    //         (error) => {
    //             console.error('Error verifying password:', error);
    //             this.snackBar.open('Error verifying password. Please try again.', 'Close', { duration: 3000 });
    //         },
    //     );
    // }

    selectTheme(theme: string): void {
        this.currentTheme = theme;
        this.themeService.setTheme(theme);
    }

    // password update
    initiatePasswordChange() {
        this.isChangingPassword = true;
        this.password.current = ''; // Clear the current password field
        this.password.new = ''; // Clear the new password field
    }

    cancelPasswordChange() {
        this.isChangingPassword = false;
        this.password.current = '';
        this.password.new = '';
        this.snackBar.open('Password change cancelled', 'Close', { duration: 3000 });
    }

    updatePassword() {
        if (!this.password.current || !this.password.new) {
            this.snackBar.open('Please fill in both current and new password fields', 'Close', { duration: 3000 });
            return;
        }

        this.cognitoService.changePassword(this.password.current, this.password.new).subscribe(
            () => {
                this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
                this.password.current = '';
                this.password.new = '';
                this.isChangingPassword = false;
            },
            (error) => {
                console.error('Error changing password:', error);
                this.snackBar.open('Error changing password. Please try again.', 'Close', { duration: 3000 });
            },
        );
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }

    back() {
        this.router.navigate(['/settings']);
    }
}
