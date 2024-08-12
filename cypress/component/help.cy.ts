import { HelpComponent } from '../../src/app/pages/help/help.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('HelpComponent', () => {
    beforeEach(() => {
        cy.viewport(1280, 720);
        cy.mount(HelpComponent, {
            imports: [
                BrowserAnimationsModule,
                // Other modules that HelpComponent depends on
            ],
        });
    });

    it('mounts successfully and tabs are correct', () => {
        cy.get('.mat-mdc-tab-header').should('exist');
        cy.get('body').should('exist');
        cy.get('#mat-tab-label-0-0').should('exist').contains('FAQ');
        cy.get('#mat-tab-label-0-1').should('exist').contains('Troubleshooting');
        cy.get('#mat-tab-label-0-2').should('exist').contains('User Guides');
        cy.get('#mat-tab-label-0-3').should('exist').contains('Contact Support');
    });

    it('mounts successfully and buttons are correct', () => {
        cy.get('.filter-buttons').should('exist');
        cy.get('.filter-buttons button').should('have.length', 6);
        cy.get('.filter-buttons button').eq(0).should('contain.text', 'General');
        cy.get('.filter-buttons button').eq(1).should('contain.text', 'Dashboard');
        cy.get('.filter-buttons button').eq(2).should('contain.text', 'Inventory');
        cy.get('.filter-buttons button').eq(3).should('contain.text', 'Team');
        cy.get('.filter-buttons button').eq(4).should('contain.text', 'Suppliers');
        cy.get('.filter-buttons button').eq(5).should('contain.text', 'Orders');
    });

    it('displays the default FAQ section', () => {
        cy.get('.faq-section').should('be.visible');
        cy.get('.faq-row.faq-row-one').should('be.visible');
        cy.get('.faq-row.faq-row-two').should('be.visible');
        cy.get('.faq-row.faq-row-two mat-expansion-panel').should('have.length.gt', 0);
    });

    it('filters FAQs when a category is selected', () => {
        cy.get('.filter-buttons button').contains('Inventory').click();
        cy.get('.faq-row.faq-row-two mat-expansion-panel').should('have.length.gt', 0);
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header')
            .first()
            .should('contain.text', 'How to add inventory?');
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header').should(
            'not.contain.text',
            'How to reset my password?',
        );
    });

    it('displays troubleshooting section when selected', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('Troubleshooting').click();
        cy.get('.troubleshooting-section').should('be.visible');
        cy.get('.troubleshooting-row-two mat-expansion-panel').should('have.length.gt', 0);
        cy.get('.troubleshooting-row-two mat-expansion-panel-header').first().should('contain.text', 'Cannot login');
    });

    it('displays user guides section when selected', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('User Guides').click();
        cy.get('.user-guides-section').should('be.visible');
        cy.get('.side-menu').should('exist');
        cy.get('.article-content').should('exist');
        cy.get('.side-menu a').should('have.length.gt', 5);
        cy.get('.article-content h4').first().should('contain.text', 'Introduction');
    });

    it('navigates to correct section in user guides', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('User Guides').click();
        cy.get('.side-menu a').contains('Dashboard').click();
        cy.get('#dashboard').should('be.visible');
        cy.get('#dashboard').should('contain.text', 'Dashboard');
    });

    it('displays contact support form', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('Contact Support').click();
        cy.get('.form-container').should('be.visible');
        cy.get('.form-container textarea').should('exist');
        cy.get('.form-container button').contains('Send').should('exist');
    });

    it('expands and collapses FAQ items', () => {
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header').first().click();
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header').first().next().should('be.visible');
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header').first().click();
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header').first().next().should('not.be.visible');
    });

    it('checks if all FAQ categories are present', () => {
        const categories = ['General', 'Dashboard', 'Inventory', 'Team', 'Suppliers', 'Orders'];
        categories.forEach((category) => {
            cy.get('.filter-buttons button').contains(category).should('exist');
        });
    });

    it('verifies FAQ content changes when different categories are selected', () => {
        cy.get('.filter-buttons button').contains('General').click();
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header')
            .first()
            .should('contain.text', 'How to reset my password?');

        cy.get('.filter-buttons button').contains('Inventory').click();
        cy.get('.faq-row.faq-row-two mat-expansion-panel-header')
            .first()
            .should('contain.text', 'How to add inventory?');
    });

    it('checks if troubleshooting issues are expandable', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('Troubleshooting').click();
        cy.get('.troubleshooting-row-two mat-expansion-panel-header').first().click();
        cy.get('.troubleshooting-row-two mat-expansion-panel-header').first().next().should('be.visible');
    });

    it('verifies user guide navigation updates content', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('User Guides').click();
        cy.get('.side-menu a').contains('Inventory').click();
        cy.get('#inventory').should('be.visible');
        cy.get('#inventory').should('contain.text', 'Inventory');
    });

    it('checks if contact support form fields are editable', () => {
        cy.get('.mdc-tab__content > .mdc-tab__text-label').contains('Contact Support').click();
        cy.get('#mat-input-39').type('John Doe');
        cy.get('#mat-input-39').should('have.value', 'John Doe');
        cy.get('#mat-input-40').type('JohnDoe@gmail.com');
        cy.get('#mat-input-40').should('have.value', 'JohnDoe@gmail.com');
        cy.get('#mat-input-41').type('This is a test message');
        cy.get('#mat-input-41').should('have.value', 'This is a test message');
    });
});
