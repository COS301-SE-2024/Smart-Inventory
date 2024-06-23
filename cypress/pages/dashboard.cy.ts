import { Component, OnInit, ChangeDetectorRef, Type } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleService } from '../../src/app/components/header/title.service';
import { MaterialModule } from '../../src/app/components/material/material.module';
import { CommonModule } from '@angular/common';
import { CompactType, GridsterItemComponent, GridsterModule } from 'angular-gridster2';
import { GridType, DisplayGrid } from 'angular-gridster2';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { AddmemberComponent } from '../../src/app/components/modal/addmember/addmember.component';
import { BubblechartComponent } from '../../src/app/components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../src/app/components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../src/app/components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../src/app/components/charts/donutchart/donutchart.component';
import { FilterService } from '../../src/app/services/filter.service';
import { LoadingService } from '../../src/app/components/loader/loading.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from '../../src/app/pages/dashboard/dashboard.component';


describe('Dashboard Component', () => {
  beforeEach(() => {
    cy.viewport(1280, 720),
    cy.mount(DashboardComponent, {
      imports: [
        MaterialModule,
        HttpClientModule,
        CommonModule,
        AddmemberComponent,
        GridsterModule,
        AgChartsAngular,
        BarchartComponent,
        DonutchartComponent,
        SaleschartComponent,
        BubblechartComponent,
        MatProgressSpinnerModule,
        BrowserAnimationsModule],
      providers: [TitleService],
    });
  });

  it('should display the main container', () => {
    cy.get('.main-container').should('be.visible');
  });

  it('should have a help button with a menu', () => {
    cy.get('#help-button').should('be.visible');
    cy.get('#help-button button').click();
    cy.get('.mat-menu-content').should('be.visible');
    cy.get('.mat-menu-content button').should('have.length', 4);
  });

  it('should display initial dashboard items', () => {
    cy.get('gridster-item').should('have.length.at.least', 4);
  });

  it('should toggle delete mode', () => {
    cy.get('#help-button button').click();
    cy.contains('Delete a Widget').click();
    cy.get('.overlay').should('be.visible');
    cy.contains('widgets marked for deletion').should('be.visible');
  });

  it('should mark items for deletion in delete mode', () => {
    cy.get('#help-button button').click();
    cy.contains('Delete a Widget').click();
    cy.get('gridster-item').first().find('.delete-icon').click();
    cy.get('.overlay p').should('contain', '1 widgets marked for deletion');
  });

  it('should add a new chart', () => {
    const initialItemCount = Cypress.$('gridster-item').length;
    cy.get('#help-button button').click();
    cy.contains('Add a Widget').click();
    cy.contains('Bar Chart').click();
    cy.get('gridster-item').should('have.length', initialItemCount + 1);
  });

  it('should display large items when active', () => {
    cy.get('.full-width-card').should('be.visible');
    cy.get('.new-full-width-card').should('be.visible');
  });

  it('should display charts', () => {
    cy.get('app-bubblechart').should('be.visible');
    cy.get('app-donutchart').should('be.visible');
  });

  it('should persist dashboard state', () => {
    // Trigger a state change (e.g., move an item)
    cy.get('gridster-item').first().trigger('mousedown', { which: 1, pageX: 0, pageY: 0 })
      .trigger('mousemove', { which: 1, pageX: 100, pageY: 100 })
      .trigger('mouseup');

    // Reload the component
    cy.mount(DashboardComponent);

    // Check if the state is persisted
    cy.window().then((win) => {
      const savedState = JSON.parse(win.localStorage.getItem('dashboardState'));
      expect(savedState).to.not.be.null;
    });
  });

  it('should finalize deletions', () => {
    const initialItemCount = Cypress.$('gridster-item').length;
    cy.get('#help-button button').click();
    cy.contains('Delete a Widget').click();
    cy.get('gridster-item').first().find('.delete-icon').click();
    cy.contains('Confirm Deletions').click();
    cy.get('gridster-item').should('have.length', initialItemCount - 1);
  });

  it('should undo deletions', () => {
    const initialItemCount = Cypress.$('gridster-item').length;
    cy.get('#help-button button').click();
    cy.contains('Delete a Widget').click();
    cy.get('gridster-item').first().find('.delete-icon').click();
    cy.contains('Undo').click();
    cy.get('gridster-item').should('have.length', initialItemCount);
  });
});