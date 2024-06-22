import { Component, OnInit, HostListener, ViewEncapsulation  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SettingsComponent } from '../src/app/pages/settings/settings.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Settings Component', () => {
    beforeEach(() => {
        cy.viewport(1280, 720),
        cy.mount(SettingsComponent, {
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
            BrowserAnimationsModule
          ],
        });
      });
  
    it('should mount the component', () => {
      cy.get('.body').should('be.visible');
    });
  
    context('Sidebar Navigation', () => {
        it('should navigate to General section and display relevant content', () => {
          cy.get('.menu-buttons button').contains('General').click();
          cy.get('.general-section').should('be.visible');
        });
    
        it('should navigate to Preferences section and display relevant content', () => {
          cy.get('.menu-buttons button').contains('Preferences').click();
          cy.get('.preferences-section').should('be.visible');
        });
    
        it('should navigate to Notifications section and display relevant content', () => {
          cy.get('.menu-buttons button').contains('Notifications').click();
          cy.get('.notifications-section').should('be.visible');
        });
    
        it('should navigate to Account section and display relevant content', () => {
          cy.get('.menu-buttons button').contains('Account').click();
          cy.get('.accounts-section').should('be.visible');
        });
      });
    
      context('General Section', () => {
        beforeEach(() => {
          cy.get('.menu-buttons button').contains('General').click();
        });
    
        it('should toggle between light and dark mode', () => {
          cy.get('.mode-toggle mat-slide-toggle').click();
          cy.get('body').should('have.class', 'dark-mode');
          cy.get('.mode-toggle mat-slide-toggle').click();
          cy.get('body').should('have.class', 'light-mode');
        });
    
        it('should fill the form fields', () => {
          cy.get('mat-select[placeholder="Time Zone"]').click().get('mat-option').contains('GMT').click();
          cy.get('mat-select[placeholder="Language"]').click().get('mat-option').contains('English').click();
          cy.get('mat-select[placeholder="Date and Time Format"]').click().get('mat-option').contains('MM/DD/YYYY').click();
        });
      });
    
      context('Notifications Section', () => {
        beforeEach(() => {
          cy.get('.menu-buttons button').contains('Notifications').click();
        });
    
        it('should make dropdown unavailable when toggle is off', () => {
          cy.get('.notification-row').first().within(() => {
            cy.get('mat-slide-toggle').should('not.be.checked');
            cy.get('mat-select').should('be.disabled');
          });
        });
    
        it('should make dropdown available when toggle is on', () => {
          cy.get('.notification-row').first().within(() => {
            cy.get('mat-slide-toggle').click();
            cy.get('mat-select').should('not.be.disabled');
          });
        });
    
        it('should check and uncheck tickboxes', () => {
          cy.get('.trigger-row').first().within(() => {
            cy.get('mat-checkbox').click().should('be.checked');
            cy.get('mat-checkbox').click().should('not.be.checked');
          });
        });
      });
    
      context('Account Section', () => {
        beforeEach(() => {
          cy.get('.menu-buttons button').contains('Account').click();
        });
    
        it('should fill in the forms with valid input', () => {
          cy.get('input[placeholder="Name"]').type('John');
          cy.get('input[placeholder="Surname"]').type('Doe');
          cy.get('input[placeholder="johndoe@mail.com"]').type('johndoe@mail.com');
          cy.get('input[placeholder="(+27) xx xxx xxxx"]').click({ force: true }).type('(+27) 12 345 6789');
          cy.get('mat-select[placeholder="Country"]').click().get('mat-option').contains('Country 1').click();
          cy.get('mat-select[placeholder="Province"]').click().get('mat-option').contains('Province 1').click();
          cy.get('mat-select[placeholder="City"]').click().get('mat-option').contains('City 1').click();
          cy.get('input[placeholder="Street Name"]').type('Main St');
          cy.get('input[placeholder="Flat/Unit Number"]').type('123');
          cy.get('input[placeholder="Zip Code"]').type('4567');
        });
    
        it('should show validation errors for invalid input', () => {
          cy.get('input[placeholder="johndoe@mail.com"]').type('invalidemail');
          cy.get('mat-error').should('contain', 'Please enter a valid email');
          cy.get('input[placeholder="(+27) xx xxx xxxx"]').click({ force: true }).type('invalidnumber');
          cy.get('mat-error').should('contain', 'Please enter a valid mobile number');
        });
    
        it('should change password', () => {
          cy.get('.change-password-button').click();
          cy.get('input[placeholder="Current Password"]').first().type('currentpassword');
          cy.get('input[placeholder="New Password"]').type('newpassword');
          cy.get('.change-password-button').click();
          cy.get('.change-password-button').should('contain', 'Change Password');
        });
    
        it('should delete account', () => {
          cy.get('.delete-button').click();
          cy.get('input[placeholder="Current Password"]').first().type('currentpassword');
          cy.get('input[placeholder="Confirm Email"]').first().type('johndoe@mail.com');
          cy.get('.confirm-delete-button').click();
          cy.on('window:alert', (text) => {
            expect(text).to.contains('Account deletion confirmed');
        });
    });
  });
});