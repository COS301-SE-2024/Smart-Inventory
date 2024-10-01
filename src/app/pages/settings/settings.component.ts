import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TitleService } from '../../components/header/title.service';
import { CognitoService } from '../../_services/cognito.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeliveryInformationModalComponent } from 'app/components/delivery-information-modal/delivery-information-modal.component';
import { EmailTemplateModalComponent } from 'app/components/email-template-modal/email-template-modal.component';
import { TemplatesQuotesSidePaneComponent } from 'app/components/templates-quotes-side-pane/templates-quotes-side-pane.component';
import { AutomationSettingsModalComponent } from 'app/components/automation-settings-modal/automation-settings-modal.component';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, TemplatesQuotesSidePaneComponent],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
    personalDetails = {
        name: '',
        surname: '',
        email: '',
    };

    passwordChange = {
        current: '',
        new: '',
    };

    isTemplateSidePaneOpen = false;

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.titleService.updateTitle('Settings');
        this.loadUserProfile();
    }

    loadUserProfile() {
        this.cognitoService.getCurrentUserAttributes().subscribe(
            (attributes) => {
                this.personalDetails.name = attributes['given_name'] || '';
                this.personalDetails.surname = attributes['family_name'] || '';
                this.personalDetails.email = attributes['email'] || '';
            },
            (error) => {
                console.error('Error loading user profile:', error);
                this.snackBar.open('Error loading user profile', 'Close', { duration: 3000 });
            },
        );
    }

    savePersonalDetails() {
        const updatedAttributes: Record<string, string> = {
            ['given_name']: this.personalDetails.name,
            ['family_name']: this.personalDetails.surname,
            ['email']: this.personalDetails.email,
        };

        this.cognitoService.updateUserAttribute(updatedAttributes).subscribe(
            () => {
                this.snackBar.open('Personal details updated successfully', 'Close', { duration: 3000 });
            },
            (error) => {
                console.error('Error updating personal details:', error);
                this.snackBar.open('Error updating personal details. Please try again.', 'Close', { duration: 3000 });
            },
        );
    }

    updatePassword() {
        if (!this.passwordChange.current || !this.passwordChange.new) {
            this.snackBar.open('Please fill in both current and new password fields', 'Close', { duration: 3000 });
            return;
        }

        this.cognitoService.changePassword(this.passwordChange.current, this.passwordChange.new).subscribe(
            () => {
                this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
                this.passwordChange.current = '';
                this.passwordChange.new = '';
            },
            (error) => {
                console.error('Error changing password:', error);
                this.snackBar.open('Error changing password. Please try again.', 'Close', { duration: 3000 });
            },
        );
    }

    editEmailTemplate() {
        const dialogRef = this.dialog.open(EmailTemplateModalComponent, {
            width: '600px',
            data: {}, // You can pass any necessary data here
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // Handle the result if needed
                console.log('Email template updated');
            }
        });
    }

    editAutomationTemplates() {
        this.isTemplateSidePaneOpen = true;
    }

    editDeliveryInfo() {
        console.log('Opening delivery information modal'); // Add this log
        const dialogRef = this.dialog.open(DeliveryInformationModalComponent, {
            width: '600px',
            data: { deliveryAddress: {} }, // Provide an empty object if you don't have initial data
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Delivery information updated:', result);
                // Handle the updated delivery information
            }
        });
    }

    changeTheme() {
        console.log('Customizing app appearance');
        // Implement the logic to customize app appearance using ThemeService
    }

    openAutomationSettings() {
        const dialogRef = this.dialog.open(AutomationSettingsModalComponent, {
            width: '600px',
            data: { ordersComponent: this },
        });
    
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('New automation settings:', result);
                // Handle the new settings if needed
            }
        });
    }

}
