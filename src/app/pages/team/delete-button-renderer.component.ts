import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Component } from '@angular/core';

@Component({
    selector: 'app-delete-button-renderer',
    standalone: true,
    template: `<button class="delete-button" (click)="onDeleteButtonClick()">Delete</button>`,
    styles: [
        `
    .delete-button {
      background-color: #E0E0E0;
      color: #616161;            
      border: none;              
      padding: 8px 12px;         
      border-radius: 4px;        
      cursor: pointer;          
      transition: background-color 0.3s ease; 
      line-height: 1.2;
    }

    .delete-button:hover {
      background-color: #BDBDBD; /* Slightly darker grey on hover */
    }

    .delete-button:active {
      background-color: #757575; /* Even darker grey when clicked */
    }
        `,
    ],
})
export class DeleteButtonRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        return true;
    }

    onDeleteButtonClick() {
        const email = this.params.data.email;
        console.log('Delete button clicked for user:', email);
        // Add your delete logic here
    }
}
