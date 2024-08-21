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
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from '../../services/theme.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
    selector: 'app-notification-settings',
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
        MatToolbarModule,
        MatGridListModule,
        MatButtonToggleModule,
    ],
    templateUrl: './notification-settings.component.html',
    styleUrl: './notification-settings.component.css',
})
export class NotificationSettingsComponent {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private themeService: ThemeService,
    ) {}
    ngOnInit() {
        this.titleService.updateTitle('Settings');
    }
    back() {
        this.router.navigate(['/settings']);
    }
}
