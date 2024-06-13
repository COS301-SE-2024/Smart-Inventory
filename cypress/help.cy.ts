import { Component, OnInit, HostListener,ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HelpComponent } from '../src/app/pages/help/help.component';
describe('Help Component', () => {
    beforeEach(() => {
        cy.viewport(1280, 720),
        cy.mount(HelpComponent, {
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
            BrowserAnimationsModule
          ],
        });
      });
  
    it('should mount the component', () => {
      cy.get('.body').should('be.visible');
    });
  
    context('Sidebar Navigation', () => {
      it('should navigate to FAQs section and display relevant content', () => {
        cy.get('.menu-buttons button').contains('FAQs').click();
        cy.get('.faq-section').should('be.visible');
      });
  
      it('should navigate to User Guides section and display relevant content', () => {
        cy.get('.menu-buttons button').contains('User Guides').click();
        cy.get('.user-guides-section').should('be.visible');
      });
  
      it('should navigate to Troubleshooting section and display relevant content', () => {
        cy.get('.menu-buttons button').contains('Troubleshooting').click();
        cy.get('.troubleshooting-section').should('be.visible');
      });
  
      it('should navigate to Contact Support section and display relevant content', () => {
        cy.get('.menu-buttons button').contains('Contact Support').click();
        cy.get('.customer-support-section').should('be.visible');
      });
  
      it('should navigate to Release Notes section and display relevant content', () => {
        cy.get('.menu-buttons button').contains('Release Notes').click();
        cy.get('.release-notes-section').should('be.visible');
      });
    });
  
    context('FAQs Section', () => {
      beforeEach(() => {
        cy.get('.menu-buttons button').contains('FAQs').click();
      });
  
      it('should filter FAQs by category', () => {
        cy.get('.filter-buttons button').contains('Account Management').click();
        cy.get('.faq-section mat-accordion mat-expansion-panel').each(panel => {
          cy.wrap(panel).find('mat-panel-title').should('contain', 'Account Management');
        });
      });
  
      it('should expand and collapse FAQs', () => {
        cy.get('.faq-section mat-accordion mat-expansion-panel').first().within(() => {
          cy.get('mat-panel-title').click();
          cy.get('p').should('be.visible');
          cy.get('mat-panel-title').click();
          cy.get('p').should('not.be.visible');
        });
      });
  
      it('should display the "Get in Touch" banner', () => {
        cy.get('.faq-section .faq-banner').should('be.visible');
      });
    });
  
    context('Troubleshooting Section', () => {
      beforeEach(() => {
        cy.get('.menu-buttons button').contains('Troubleshooting').click();
      });
  
      it('should display troubleshooting issues', () => {
        cy.get('.troubleshooting-section mat-accordion mat-expansion-panel').should('have.length.greaterThan', 0);
      });
  
      it('should expand and collapse troubleshooting issues', () => {
        cy.get('.troubleshooting-section mat-accordion mat-expansion-panel').first().within(() => {
          cy.get('mat-panel-title').click();
          cy.get('p').should('be.visible');
          cy.get('mat-panel-title').click();
          cy.get('p').should('not.be.visible');
        });
      });
  
      it('should display the "Get in Touch" banner', () => {
        cy.get('.troubleshooting-section .troubleshooting-banner').should('be.visible');
      });
    });
  
    context('Contact Support Section', () => {
      beforeEach(() => {
        cy.get('.menu-buttons button').contains('Contact Support').click();
      });
  
      it('should fill and submit the contact support form', () => {
        cy.get('input[placeholder="Name"]').type('John Doe');
        cy.get('input[placeholder="Email Address"]').type('johndoe@example.com');
        cy.get('textarea[placeholder="Message"]').type('I need help with my account.');
        cy.get('.send-button').click();
        cy.get('body').should('contain', 'Send button clicked'); // Assuming the console log will display as part of the test environment
      });
  
      it('should display the "Get in Touch" banner', () => {
        cy.get('.customer-support-banner').should('be.visible');
      });
    });
  
    context('User Guides Section', () => {
      beforeEach(() => {
        cy.get('.menu-buttons button').contains('User Guides').click();
      });
  
      it('should display user guides', () => {
        cy.get('.user-guides-section').should('be.visible');
      });
  
      it('should navigate to a specific guide and scroll to its content', () => {
        cy.get('.side-menu a').contains('Setup Guides').click();
        cy.get('.side-menu a').contains('Initial Setup').click();
        cy.url().should('include', '#initial-setup');
        cy.get('.article-content h3#initial-setup').should('be.visible');
      });
  
      it('should display the "Get in Touch" banner', () => {
        cy.get('.user-guides-banner').should('be.visible');
      });
    });
  
    context('Release Notes Section', () => {
      beforeEach(() => {
        cy.get('.menu-buttons button').contains('Release Notes').click();
      });
  
      it('should display under construction message', () => {
        cy.get('.release-notes-section').should('contain', 'Under Construction');
      });
  
      it('should display the "Get in Touch" banner', () => {
        cy.get('.release-notes-banner').should('be.visible');
      });
    });
  
    context('General Functionality', () => {
      it('should toggle between light and dark mode', () => {
        cy.get('.mode-toggle mat-slide-toggle').click();
        cy.get('body').should('have.class', 'dark-mode');
        cy.get('.mode-toggle mat-slide-toggle').click();
        cy.get('body').should('have.class', 'light-mode');
      });
  
      it('should display save and cancel buttons and show snackbar on click', () => {
        cy.get('.save-button').click();
        cy.get('snack-bar-container').should('contain', 'Changes saved successfully');
        cy.get('.cancel-button').click();
        cy.get('snack-bar-container').should('contain', 'Changes not saved');
      });
    });
  });
  