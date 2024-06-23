import { TeamComponent } from '../../src/app/pages/team/team.component';
import { GridComponent } from '../../src/app/components/grid/grid.component';
import { DeleteButtonRenderer } from '../../src/app/pages/team/delete-button-renderer.component';
import { RoleSelectCellEditorComponent } from '../../src/app/pages/team/role-select-cell-editor.component';
import { MatDialog } from '@angular/material/dialog';

describe('TeamComponent', () => {
  beforeEach(() => {
    cy.mount(TeamComponent, {
      imports: [GridComponent, DeleteButtonRenderer, RoleSelectCellEditorComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: cy.stub().as('dialogOpen')
          }
        }
      ]
    });
  });

  it('should display the grid when data is available', () => {
    cy.get('.grid-container').should('be.visible');
    cy.get('app-grid').should('exist');
  });

  it('should open the add member popup when the add button is clicked', () => {
    cy.get('button').contains('Add Member').click();
    cy.get('.popup-overlay').should('be.visible');
    cy.get('.popup-content').should('contain', 'Add Member');
  });

  it('should close the add member popup when cancel is clicked', () => {
    cy.get('button').contains('Add Member').click();
    cy.get('.popup-overlay').should('be.visible');
    cy.get('button').contains('Cancel').click();
    cy.get('.popup-overlay').should('not.exist');
  });

  it('should not submit the form with invalid data', () => {
    cy.get('button').contains('Add Member').click();
    cy.get('button').contains('Submit').should('be.disabled');
  });

  it('should submit the form with valid data', () => {
    cy.get('button').contains('Add Member').click();
    cy.get('#name').type('John');
    cy.get('#surname').type('Doe');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#role').select('Admin');
    cy.get('button').contains('Submit').click();
    // You might want to stub the onSubmit method and check if it's called
    cy.get('.popup-overlay').should('not.exist');
  });

  it('should render delete buttons for each row', () => {
    cy.get('.delete-button').should('have.length.at.least', 1);
  });

  it('should open delete confirmation dialog when delete button is clicked', () => {
    cy.get('.delete-button').first().click();
    cy.get('@dialogOpen').should('have.been.called');
  });

  it('should render role select for each row', () => {
    cy.get('.role-button').should('have.length.at.least', 1);
  });

  it('should open role change confirmation dialog when role is changed', () => {
    cy.get('.role-button').first().click();
    cy.get('.mat-menu-content button').contains('End User').click();
    cy.get('@dialogOpen').should('have.been.called');
  });

  it('should update the title', () => {
    // Assuming you have a way to check the title, e.g., a title service
    cy.window().its('titleService.title').should('eq', 'Team');
  });
});