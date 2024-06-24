import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
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
import { TitleService } from '../../src/app/components/header/title.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SettingsComponent } from '../../src/app/pages/settings/settings.component';
import { slowCypressDown } from 'cypress-slow-down';

slowCypressDown();

describe('SettingsComponent', () => {
  beforeEach(() => {
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
        ReactiveFormsModule,
        MatCardModule,
        MatCheckboxModule,
        MatGridListModule,
        BrowserAnimationsModule
      ],
      providers: [TitleService, MatSnackBar]
    });
  });

  it('should mount the component', () => {
    cy.get('mat-tab-group').should('exist');
  });

  context('Profile Tab', () => {
    beforeEach(() => {
      cy.get('mat-tab-group').find('mat-tab-header').contains('Profile').click();
    });

    it('should fill in personal details', () => {
      cy.get('.mat-mdc-form-field-infix input[placeholder="Name"]').should('be.visible').type('John');
      cy.get('.mat-mdc-form-field-infix input[placeholder="Surname"]').should('be.visible').type('Doe');
      cy.get('.mat-mdc-form-field-infix input[placeholder="johndoe@mail.com"]').should('be.visible').type('john.doe@example.com');
    });

    it('should toggle change password form', () => {
      cy.get('button.change-password-button').click();
      cy.get('.mat-mdc-form-field-infix input[placeholder="New Password"]').should('be.visible');
      cy.get('button.change-password-button').contains('Save Password');
      cy.get('button.cancel-password-button').click();
      cy.get('.mat-mdc-form-field-infix input[placeholder="New Password"]').should('not.exist');
    });

    it('should toggle delete account form', () => {
      // Initially, the delete account form should not be visible
      // cy.get('div[style="height: 10vh"]').should('not.be.visible');
    
      // Click the delete account button to show the form
      cy.get('button.delete-button').click();
    
      // The form should now be visible
      // cy.get('div[style="height: 10vh"]').should('be.visible');
    
      // Check if the input fields are visible and interactable
      cy.get('input[placeholder="Current Password"]')
        .should('be.visible')
        .and('not.be.disabled');
    
      cy.get('input[placeholder="Confirm Email"]')
        .should('be.visible')
        .and('not.be.disabled');
    
      // Check if the confirm delete button is visible
      cy.get('button.confirm-delete-button')
        .should('be.visible')
        .and('contain', 'Confirm Delete');
    
      // Click the delete account button again to hide the form
      cy.get('button.delete-button').click();
    
      // The form should now be hidden
      // cy.get('div[style="height: 10vh"]').should('not.be.visible');
    
      // Optionally, test the confirm delete functionality
      cy.get('button.delete-button').click();
      cy.get('button.confirm-delete-button').click();
      cy.on('window:alert', (str) => {
        expect(str).to.equal('Account deletion confirmed');
      });
      // cy.get('div[style="height: 10vh"]').should('not.be.visible');
    });
  });

  context('Settings Tab', () => {
    beforeEach(() => {
      cy.get('mat-tab-group').find('mat-tab-header').contains('Settings').click();
    });

    it('should select theme', () => {
      cy.get('.theme-option img[alt="Light Mode"]').parent().click();
      cy.get('.theme-option').first().should('have.class', 'selected-theme');
      cy.get('.theme-option img[alt="Dark Mode"]').parent().click();
      cy.get('.theme-option').last().should('have.class', 'selected-theme');
    });

    it('should toggle notifications and select frequency', () => {
      cy.get('.notification-row').first().within(() => {
        cy.get('mat-slide-toggle').click();
        cy.get('.mat-mdc-form-field-infix').should('be.visible').click();
      });
      cy.get('.cdk-overlay-container mat-option').contains('Daily').click();
      cy.get('.notification-row').first().within(() => {
        cy.get('.mat-mdc-form-field-infix').should('contain', 'Daily');
      });
    });

    it('should toggle notification triggers', () => {
      cy.get('.trigger-row').first().within(() => {
        cy.get('mat-checkbox').click();
        cy.get('mat-checkbox input').should('be.checked');
      });
    });
  });
});