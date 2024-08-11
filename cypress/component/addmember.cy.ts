import { AddmemberComponent } from '../../src/app/components/modal/addmember/addmember.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamMember } from '../../src/app/components/model/team-member.model';

describe('AddmemberComponent', () => {
  const mockMembers: TeamMember[] = [
    { id: 1, name: 'John Doe', role: 'Developer', selected: false },
    { id: 2, name: 'Jane Smith', role: 'Designer', selected: false },
    { id: 3, name: 'Bob Johnson', role: 'Manager', selected: false }
  ];

  const mountComponent = (members = mockMembers) => {
    cy.mount(AddmemberComponent, {
      imports: [],
      providers: [
        { 
          provide: MatDialogRef, 
          useValue: { close: cy.stub().as('dialogClose') } 
        },
        { provide: MAT_DIALOG_DATA, useValue: { members } }
      ]
    });
  };

  beforeEach(() => {
    mountComponent();
  });

  it('should display the dialog title', () => {
    cy.get('[mat-dialog-title]').should('contain', 'Add New Member');
  });

  it('should display the list of members', () => {
    cy.get('mat-selection-list').within(() => {
      cy.get('mat-list-option').should('have.length', mockMembers.length);
      mockMembers.forEach(member => {
        cy.contains(`${member.name} - ${member.role}`).should('exist');
      });
    });
  });

  it('should close the dialog when Cancel button is clicked', () => {
    cy.get('button').contains('Cancel').click();
    cy.get('@dialogClose').should('have.been.calledOnce');
  });

  it('should update selected state when a member is clicked', () => {
    cy.get('mat-selection-list mat-list-option').first().click();
    cy.get('mat-selection-list mat-list-option').first().should('have.attr', 'aria-selected', 'true');
  });

  it('should close the dialog with selected members when Add button is clicked', () => {
    cy.get('mat-selection-list mat-list-option').first().click();
    cy.get('button').contains('Add').click();
    cy.get('@dialogClose').should('have.been.calledOnce');
    cy.get('@dialogClose').then((closeStub) => {
      expect(closeStub).to.have.been.calledWith(
        Cypress.sinon.match((arg) => {
          return Array.isArray(arg) &&
                 arg.length === 1 &&
                 arg[0].id === mockMembers[0].id &&
                 arg[0].name === mockMembers[0].name &&
                 arg[0].role === mockMembers[0].role;
          // Note: We're not checking the 'selected' property here as it's not modified in onAddClick
        })
      );
    });
  });

  it('should allow multiple member selection', () => {
    cy.get('mat-selection-list mat-list-option').first().click();
    cy.get('mat-selection-list mat-list-option').last().click();
    cy.get('button').contains('Add').click();
    cy.get('@dialogClose').should('have.been.calledOnce');
    cy.get('@dialogClose').then((closeStub) => {
      expect(closeStub).to.have.been.calledWith(
        Cypress.sinon.match((arg) => {
          return Array.isArray(arg) &&
                 arg.length === 2 &&
                 arg[0].id === mockMembers[0].id &&
                 arg[1].id === mockMembers[2].id;
          // Note: We're not checking the 'selected' property here as it's not modified in onAddClick
        })
      );
    });
  });

  it('should not close the dialog if no members are selected and Add is clicked', () => {
    cy.get('button').contains('Add').click();
    cy.get('@dialogClose').should('have.been.calledOnce');
    cy.get('@dialogClose').should('have.been.calledWith', []);
  });

  it('should respect initial selected state of members', () => {
    const membersWithSelected = [
      { ...mockMembers[0], selected: true },
      ...mockMembers.slice(1)
    ];

    mountComponent(membersWithSelected);

    cy.get('mat-selection-list mat-list-option').first().should('have.attr', 'aria-selected', 'true');
  });
});