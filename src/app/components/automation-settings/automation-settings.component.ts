import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog } from '@angular/material/dialog';
import { CustomQuoteModalComponent } from '../../components/custom-quote-modal/custom-quote-modal.component';
import { TemplateDialogComponent } from './template-dialog.component';
@Component({
    selector: 'app-automation-settings',
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
        AutomationSettingsComponent,
        CustomQuoteModalComponent,
    ],
    templateUrl: './automation-settings.component.html',
    styleUrl: './automation-settings.component.css',
})
export class AutomationSettingsComponent {
    constructor(private dialog: MatDialog) {}
    templates = {
        template1: {
            title: 'Amazon',
            subtitle: 'Order to be Automated',
            frequency: 'Monthly',
            items: '',
        },
        template2: {
            title: 'Takealot',
            subtitle: 'Order to be Automated',
            frequency: 'Weekly',
            items: '',
        },
        template3: {
            title: 'Uber Eats',
            subtitle: 'Order to be Automated',
            frequency: 'Quaterly',
            items: '',
        },
    };

    openDialog(template: any): void {
        const dialogRef = this.dialog.open(TemplateDialogComponent, {
            width: '250px',
            data: { template: template },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // Handle the result
                console.log('Dialog result:', result);
            }
        });
    }
    
}
