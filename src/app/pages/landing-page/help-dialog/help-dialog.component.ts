import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Login Help</h2>
    <mat-dialog-content>
      <div class="help-section">
        <button mat-flat-button (click)="toggleSection('login')" [class.active]="activeSection === 'login'">
          Cannot login
        </button>
        <p *ngIf="activeSection === 'login'">
          Firstly make sure you have a good network connection. Then make sure that you are providing the correct details and that the password is correct. If you are sure your details are correct and it still tells you your password is incorrect click on forgot password. If you are still having issues please <a href="mailto:helixcapstone@gmail.com">contact us</a>.
        </p>
      </div>

      <div class="help-section">
        <button mat-flat-button (click)="toggleSection('verification')" [class.active]="activeSection === 'verification'">
          Forget password verification code not sent
        </button>
        <p *ngIf="activeSection === 'verification'">
          If the current screen says a code has been sent. Check that you are looking at the correct email that it would send it to. Also check that you have internet connection. If it is still not there ask to resend the code by clicking on "resend code". If you are still having issues please <a href="mailto:helixcapstone@gmail.com">contact us</a>.
        </p>
      </div>

      <div class="help-section">
        <button mat-flat-button (click)="toggleSection('account')" [class.active]="activeSection === 'account'">
          Cannot create an account
        </button>
        <p *ngIf="activeSection === 'account'">
          If you have been provided with a login link there is no need to create an account as your admin created your account you only need to verify your password with your email. If you are an admin and cannot create an account check that if you have already created one you are not using the same email. Any further issues please <a href="mailto:helixcapstone@gmail.com">contact us</a>.
        </p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 600px;
    }
    .help-section {
      margin-bottom: 16px;
    }
    button {
      background-color: #0052cc;
      color: white;
      width: 100%;
      text-align: center;
      display: block;
      margin-bottom: 8px;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: #0043a4;
    }
    button.active {
      background-color: #003d94;
    }
    p {
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }
    mat-dialog-actions button {
      width: auto;
    }
    a {
      color: #0052cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class HelpDialogComponent {
  activeSection: string | null = null;

  constructor(public dialogRef: MatDialogRef<HelpDialogComponent>) {}

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }
}