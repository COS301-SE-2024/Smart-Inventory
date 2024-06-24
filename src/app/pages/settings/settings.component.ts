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
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TitleService } from '../../components/header/title.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { Router } from '@angular/router';

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
        ReactiveFormsModule,
        MatExpansionModule,
        MatListModule,
        MatSelectModule,
        MatTabsModule,
        MatCardModule,
        MatCheckboxModule,
        MatGridListModule,
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css',
    encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);

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

    currentTheme = 'light';
    isDeleteAccountVisible = false;

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private authenticator: AuthenticatorService,
        private router: Router
    ) {}

    ngOnInit() {
        this.titleService.updateTitle('Settings');
        this.loadUserProfile();
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
            }
        );
    }

    saveProfileChanges() {
        const updatedAttributes: Record<string, string> = {
          ['given_name']: this.profile.name,
          ['family_name']: this.profile.surname,
          ['email']:this.profile.email
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
          }
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
            }
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
                            this.snackBar.open('Error deleting account. Please try again.', 'Close', { duration: 3000 });
                        }
                    );
                } else {
                    this.snackBar.open('Invalid password', 'Close', { duration: 3000 });
                }
            },
            (error) => {
                console.error('Error verifying password:', error);
                this.snackBar.open('Error verifying password. Please try again.', 'Close', { duration: 3000 });
            }
        );
    }

    selectTheme(theme: string) {
        this.currentTheme = theme;
        // Implement theme change logic here
    }
}