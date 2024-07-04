import { Component, Input } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-view-quote-button-renderer',
    template: `<button class="action-button" (click)="onClick()">View Quote</button>`,
    styles: [`
        .action-button {
            background-color: #e0e0e0;
            color: #616161;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            line-height: 1.2;
        }

        .action-button:hover {
            background-color: #bdbdbd;
        }

        .action-button:active {
            background-color: #757575;
        }
    `],
    standalone: true
})
export class ViewQuoteButtonRendererComponent implements ICellRendererAngularComp {
    @Input() params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    onClick() {
        console.log('View Quote clicked for:', this.params.data);
        // Implement view quote logic here
    }
}