import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TitleService } from '../../components/header/title.service';
import { CognitoService } from '../../_services/cognito.service';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { ThemeService } from '../../services/theme.service';
import { DeliveryInformationModalComponent } from '../../components/delivery-information-modal/delivery-information-modal.component';
import { EmailTemplateModalComponent } from '../../components/email-template-modal/email-template-modal.component';
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
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        TemplatesQuotesSidePaneComponent,
        EmailTemplateModalComponent,
        DeliveryInformationModalComponent,
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
    isTemplateSidePaneOpen = false;
    private role: string = '';
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

    personalDetails = {
        name: '',
        surname: '',
        email: '',
    };

    passwordChange = {
        current: '',
        new: '',
    };

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private cognitoService: CognitoService,
        private authenticator: AuthenticatorService,
        private router: Router,
        private themeService: ThemeService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.titleService.updateTitle('Settings');
        this.loadUserProfile();
        this.logAuthSession();
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
        this.dialog.open(EmailTemplateModalComponent);
    }

    editAutomationTemplates() {
        this.isTemplateSidePaneOpen = true;
    }

    editDeliveryInfo() {
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

    changeTheme() {
        console.log('Customizing app appearance');
        // Implement the logic to customize app appearance using ThemeService
    }
}
