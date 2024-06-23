import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HelpComponent } from '../../src/app/pages/help/help.component';
import { slowCypressDown } from 'cypress-slow-down';

// slowCypressDown();

describe('HelpComponent', () => {
  beforeEach(() => {
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
        MatTabsModule,
        BrowserAnimationsModule
      ],
    });
  });

  it('should mount the component', () => {
    cy.get('mat-tab-group').should('be.visible');
  });

  context('FAQs Tab', () => {
    beforeEach(() => {
      cy.get('mat-tab-group').contains('FAQs').click();
    });

    it('should display FAQ filters', () => {
      cy.get('.filter-buttons button').should('have.length', 4);
    });

    it('should filter FAQs when a category is clicked', () => {
      cy.get('.filter-buttons button').contains('Account Management').click();
      cy.get('mat-expansion-panel-header').should('contain', 'How to reset my password?');
    });

    it('should expand and collapse FAQ items', () => {
      cy.get('mat-expansion-panel-header').first().click();
      cy.get('mat-expansion-panel-header').first().next().should('be.visible');
      cy.get('mat-expansion-panel-header').first().click();
      cy.get('mat-expansion-panel-header').first().next().should('not.be.visible');
    });
  });

  context('Troubleshooting Tab', () => {
    beforeEach(() => {
      cy.get('mat-tab-group').contains('Troubleshooting').click();
    });

    it('should display troubleshooting issues', () => {
      cy.get('mat-expansion-panel').should('have.length.greaterThan', 0);
    });

    it('should expand and collapse troubleshooting items', () => {
      cy.get('mat-expansion-panel-header').first().click();
      cy.get('mat-expansion-panel-header').first().next().should('be.visible');
      cy.get('mat-expansion-panel-header').first().click();
      cy.get('mat-expansion-panel-header').first().next().should('not.be.visible');
    });
  });

  context('User Guides Tab', () => {
    beforeEach(() => {
      cy.get('mat-tab-group').contains('User Guides').click();
    });
  
    it('should display the side menu', () => {
      cy.get('.side-menu').should('be.visible');
    });
  
    it('should navigate to different sections', () => {
      cy.get('.side-menu a').contains('Initial Setup').click();
      cy.get('#initial-setup').should('be.visible');
    });
  
    it('should have a video tutorial section', () => {
      cy.get('.video-frame').should('exist');
      cy.get('.video-frame iframe.responsive-video').should('exist')
        .and(($iframe) => {
          expect($iframe.attr('src')).to.include('youtube.com');
        });
    });
  });

  context('Contact Support Tab', () => {
    beforeEach(() => {
      cy.get('mat-tab-group').contains('Contact Support').click();
    });

    it('should display the contact form', () => {
      cy.get('form').should('be.visible');
    });

    it('should fill out and submit the form', () => {
      cy.get('input[placeholder="Name"]').type('John Doe');
      cy.get('input[placeholder="Email Address"]').type('john@example.com');
      cy.get('textarea[placeholder="Message"]').type('Test message');
      cy.get('button.send-button').click();
      // Add an assertion here for what should happen after form submission
    });
  });

  it('should update the title when switching tabs', () => {
    cy.get('mat-tab-group').contains('Troubleshooting').click();
    // Add an assertion here to check if the title has been updated
    // This might require exposing the title in the DOM or using a stub for the TitleService
  });
});
  