import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TitleService } from '../../components/header/title.service';

@Component({
    selector: 'app-contact-support',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCardModule,
        ReactiveFormsModule,
    ],
    templateUrl: './contact-support.component.html',
    styleUrls: ['./contact-support.component.css'],
})
export class ContactSupportComponent implements OnInit {
    supportForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private titleService: TitleService,
    ) {
        this.supportForm = this.formBuilder.group({
            name: ['', Validators.required],
            surname: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            message: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.titleService.updateTitle('Help');
    }

    onSubmit() {
        if (this.supportForm.valid) {
            // Here you would typically send the form data to your backend
            console.log(this.supportForm.value);

            const config = new MatSnackBarConfig();
            config.duration = 3000;
            config.horizontalPosition = 'center';
            config.verticalPosition = 'bottom';
            config.panelClass = ['custom-snackbar'];

            this.snackBar.open('Your message has been sent successfully!', 'Close', config);

            // Reset the form without triggering validation
            this.supportForm.reset(
                {
                    name: '',
                    surname: '',
                    email: '',
                    message: '',
                },
                { emitEvent: false, onlySelf: true },
            );

            // Update the form control states
            Object.keys(this.supportForm.controls).forEach((key) => {
                const control = this.supportForm.get(key);
                control?.setErrors(null);
                control?.markAsUntouched();
                control?.markAsPristine();
            });
        } else {
            this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 3000 });
        }
    }
}
