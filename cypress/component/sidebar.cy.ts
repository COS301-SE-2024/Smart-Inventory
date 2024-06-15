import { SidebarComponent } from '../../src/app/components/sidebar/sidebar.component';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../src/app/components/material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
describe('SidebarComponent', () => {
    beforeEach(() => {
        cy.mount(SidebarComponent, {
            imports: [MaterialModule, CommonModule, RouterLink, FormsModule, MatIconModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: { route: { path: 'dashboard' } },
                    },
                },
            ],
        });
    });
    it('should be initially not be expanded', () => {
        cy.get('.sidenav').should('be.visible');
        cy.get('.sidenav').should('not.have.class', 'expanded'); // Assuming the expanded class adds width
    });

    it('should be expanded when menu clicked', () => {
        cy.get('.mat-toolbar').click();
        cy.get('.sidenav').should('be.visible');
        cy.get('.sidenav').should('have.class', 'expanded');
    });

    it('dashboard should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(1) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Dashboard');
    });

    it('inventory should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(2) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Inventory');
    });

    it('dashboard should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(3) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Reports');
    });

    it('team should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(4) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Team');
    });

    it('suppliers should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(5) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Suppliers');
    });

    it('order should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(6) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Orders');
    });

    it('settings should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(7) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Settings');
    });

    it('logout should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(8) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content',
        ).should('contain', 'Log Out');
    });

    it('dashboard icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(1) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'dashboard');
    });

    it('inventory icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(2) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'inventory_2');
    });

    it('reports icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(3) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'assessment');
    });

    it('team icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(4) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'people');
    });

    it('suppliers icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(5) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'local_shipping');
    });

    it('order icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(6) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'assignment');
    });

    it('settings icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(7) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'settings');
    });

    it('logout icon should be visible', () => {
        cy.get('.mat-toolbar').click();
        cy.get(
            ':nth-child(8) > .mat-mdc-list-item > .mdc-list-item__content > .mat-mdc-list-item-unscoped-content > .mat-icon',
        ).should('contain', 'exit_to_app');
    });
});
