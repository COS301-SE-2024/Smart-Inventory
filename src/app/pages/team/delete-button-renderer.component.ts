import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Component } from '@angular/core';

@Component({
  selector: 'app-delete-button-renderer',
  standalone: true,
  template: `<button class="delete-button" (click)="onDeleteButtonClick()">Delete</button>`,
  styles: [`
    .delete-button {;
      font-size: 12px;
    }
  `]
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