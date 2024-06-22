import { HeaderComponent } from '../../src/app/components/header/header.component';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../src/app/components/material/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
describe('SidebarComponent', () => {
    beforeEach(() => {
        cy.mount(HeaderComponent, {
            imports: [MaterialModule, CommonModule, RouterLink, FormsModule, MatIconModule, BrowserAnimationsModule],
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

    it('Header should be visible and exists', () => {
        cy.get('.mat-toolbar').should('exist').should('be.visible');
    });

    it('Header should have a title defualt', () => {
        cy.get('.mat-toolbar > :nth-child(1)').should('be.visible').contains('Default Title');
    });

    it('Header should have a user bar', () => {
        cy.get('.profile-box').should('exist').should('be.visible');
    });

    it('User bar has image', () => {
        cy.get('.profile-pic').should('exist').should('be.visible');
    });

    it('User bar has a username and it attribute', () => {
        cy.get('.username').should('exist').should('be.visible');
    });

    it('User bar has a role for uer and it attribute', () => {
        cy.get('.role').should('exist').should('be.visible');
    });

    it('User bar can be clicked', () => {
        cy.get('.profile-box').click();
    });

    it('User bar once clicked shows profile', () => {
        cy.get('.profile-box').click();
        cy.get('.mat-mdc-menu-content').should('exist').should('be.visible').contains('Profile');
    });
});
