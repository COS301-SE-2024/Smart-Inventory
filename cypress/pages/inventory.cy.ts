// inventory.component.cy.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../amplify_outputs.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryComponent } from '../../src/app/pages/inventory/inventory.component';
import { GridComponent } from '../../src/app/components/grid/grid.component';
import { TitleService } from '../../src/app/components/header/title.service';
import '../../src/app/pages/inventory/inventory.component.css';

describe('InventoryComponent', () => {
  beforeEach(() => {
    cy.mount(InventoryComponent, {
      declarations: [Component,GridComponent, MatButtonModule, CommonModule, FormsModule],
      providers: [TitleService],
    });
  });

  it('should display the grid component', () => {
    cy.get('app-grid').should('exist');
  });

  it('should open add item popup when add button is clicked', () => {
    cy.get('app-grid').find('button').contains('Add New Item').click();
    cy.get('.popup-overlay').should('be.visible');
    cy.get('.popup-content').contains('h2', 'Add Inventory Item');
  });

  it('should close add item popup when cancel button is clicked', () => {
    cy.get('app-grid').find('button').contains('Add New Item').click();
    cy.get('.popup-content').find('button').contains('Cancel').click();
    cy.get('.popup-overlay').should('not.exist');
  });

  it('should validate form fields in add item popup', () => {
    cy.get('app-grid').find('button').contains('Add New Item').click();
    cy.get('.popup-content').find('button').contains('Submit').should('be.disabled');

    cy.get('#productId').type('TEST001');
    cy.get('#description').type('Test Product');
    cy.get('#quantity').type('10');
    cy.get('#sku').type('SKU001');
    cy.get('#supplier').type('Test Supplier');

    cy.get('.popup-content').find('button').contains('Submit').should('not.be.disabled');
  });

  it('should show delete confirmation popup when rows are selected for deletion', () => {
    // Mock the selection of rows
    cy.window().then((win) => {
      const component = win.document.querySelector('app-inventory') as any;
      if (component) {
        component.handleRowsToDelete([{ id: 1 }]);
        
        // Move these assertions inside the if block to ensure they only run if the component exists
        cy.get('.popup-overlay').should('be.visible');
        cy.get('.popup-content').contains('h2', 'Confirm Deletion');
      } else {
        throw new Error('app-inventory component not found');
      }
    });
  });

  it('should close delete confirmation popup when "No" is clicked', () => {
    // Mock the selection of rows
    cy.window().then((win) => {
      const component = win.document.querySelector('app-inventory') as any;
      if (component) {
        component.handleRowsToDelete([{ id: 1 }]);
        
        // Move these assertions and actions inside the if block
        cy.get('.popup-content').find('button').contains('No').click();
        cy.get('.popup-overlay').should('not.exist');
      } else {
        throw new Error('app-inventory component not found');
      }
    });
  });

  // Additional tests can be added here for other UI interactions
});