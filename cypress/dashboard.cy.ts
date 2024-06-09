import { DashboardComponent } from '../../../src/app/pages/dashboard/dashboard.component';
import { MaterialModule } from 'src/app/material.module';
import { AddmemberComponent } from 'src/app/addmember/addmember.component';
import { BubblechartComponent } from 'src/app/bubblechart/bubblechart.component';
import { SaleschartComponent } from 'src/app/saleschart/saleschart.component';
import { BarchartComponent } from 'src/app/barchart/barchart.component';
import { DonutchartComponent } from 'src/app/donutchart/donutchart.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TitleService } from 'src/app/title.service';
import { FilterService } from 'src/app/filter.service';
import { ChangeDetectorRef } from '@angular/core';

describe('Dashboard Component', () => {
  beforeEach(() => {
    cy.mount(DashboardComponent, {
      imports: [
        MaterialModule,
        CommonModule,
        AddmemberComponent,
        BubblechartComponent,
        SaleschartComponent,
        BarchartComponent,
        DonutchartComponent,
        MatDialogModule
      ],
      providers: [MatDialog, TitleService, FilterService, ChangeDetectorRef],
    });
  });

  it('should display the header elements', () => {
    cy.get('.header').contains('Team');
    cy.get('.header').contains('Summary');
    cy.get('.header').contains('Quick Actions');
    cy.get('.header').contains('Stock Report');
  });

  it('should have an Add Member button and open dialog on click', () => {
    cy.get('.add-button').contains('Add Member').click();
    cy.get('mat-dialog-container').should('be.visible'); // Check if the dialog is opened
  });

  it('should display team members with correct info', () => {
    cy.get('.list-with-avatars li').should('have.length', 3);
    cy.get('.list-with-avatars li').each(($el, index, $list) => {
      cy.wrap($el).find('.name').should('not.be.empty');
      cy.wrap($el).find('img').should('have.attr', 'src').should('include', 'https://via.placeholder.com/50');
    });
  });

  it('should allow removing a team member', () => {
    cy.get('.list-with-avatars li').first().find('button').contains('Delete').click();
    cy.get('.list-with-avatars li').should('have.length', 2); // Assuming one member is removed
  });

  it('should display quick action items', () => {
    const actions = ['Add Member', 'Create Order', 'Add Product', 'Add Supplier', 'Export'];
    actions.forEach(action => {
      cy.get('.quick-actions .action-list').contains(action);
    });
  });

  it('should display analytics data points', () => {
    cy.get('.analytics .data-point').contains('Sales');
    cy.get('.analytics .data-point').contains('Earnings');
    cy.get('.analytics .data-point').contains('$38,100');
    cy.get('.analytics .data-point').contains('$23,500');
  });

  it('should filter chart data based on selected filter', () => {
    const filters = ['This year', 'This month', 'This week', 'Today'];
    filters.forEach(filter => {
      cy.get('.chart-filters button').contains(filter).click();
      // Assuming there's a method to verify the filter effect
    });
  });

  it('should display chart components', () => {
    cy.get('app-saleschart').should('be.visible');
    cy.get('app-barchart').should('be.visible');
    cy.get('app-donutchart').should('be.visible');
  });

  it('should open help options menu', () => {
    cy.get('#help-button button').contains('Help Options').click();
    cy.get('mat-menu').contains('Add a Widget');
    cy.get('mat-menu').contains('Help');
    cy.get('mat-menu').contains('Settings');
  });

  it('should open widget menu', () => {
    cy.get('#help-button button').contains('Help Options').click();
    cy.get('button').contains('Add a Widget').click();
    cy.get('mat-menu').contains('Bar Chart');
    cy.get('mat-menu').contains('Donut Chart');
    cy.get('mat-menu').contains('Bubble Chart');
  });
});
