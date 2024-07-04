import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ViewQuoteButtonRendererComponent } from './view-quote-button-renderer.component';
import { ViewReceivedQuotesButtonRendererComponent } from './view-received-quotes-button-renderer.component';
import { NgComponentOutlet } from '@angular/common';

@Component({
    selector: 'app-actions-renderer',
    template: `
        <div style="display: flex; gap: 5px;">
            <ng-container *ngComponentOutlet="viewQuoteComponent; inputs: viewQuoteInputs"></ng-container>
            <ng-container *ngComponentOutlet="viewReceivedQuotesComponent; inputs: viewReceivedQuotesInputs"></ng-container>
        </div>
    `,
    standalone: true,
    imports: [NgComponentOutlet, ViewQuoteButtonRendererComponent, ViewReceivedQuotesButtonRendererComponent]
})
export class ActionsRendererComponent implements ICellRendererAngularComp {
    params!: ICellRendererParams;
    viewQuoteComponent = ViewQuoteButtonRendererComponent;
    viewReceivedQuotesComponent = ViewReceivedQuotesButtonRendererComponent;
    viewQuoteInputs: { params: ICellRendererParams } = { params: {} as ICellRendererParams };
    viewReceivedQuotesInputs: { params: ICellRendererParams } = { params: {} as ICellRendererParams };

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.viewQuoteInputs = { params: this.params };
        this.viewReceivedQuotesInputs = { params: this.params };
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}