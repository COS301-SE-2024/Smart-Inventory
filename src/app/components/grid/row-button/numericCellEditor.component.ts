import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: '<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value" class="ag-input-field-input" />',
})
export class NumericCellEditor implements ICellEditorAngularComp, AfterViewInit {
    public value!: string;
    private focusAfterAttached!: boolean;

    @ViewChild('input', { read: ViewContainerRef }) public input!: ViewContainerRef;

    agInit(params: ICellEditorParams): void {
        // we only want to highlight this cell if it started the edit; it's possible
        // another cell in this row started the edit
        this.focusAfterAttached = params.cellStartedEdit;

        this.value = params.value;
    }

    getValue(): number | null {
        const value = this.value;
        return value === '' || value == null ? null : parseInt(value);
    }

    onKeyDown(event: any): void {
        if (!event.key || event.key.length !== 1) {
            return;
        }
        this.input.element.nativeElement.focus();

        if (event.preventDefault) event.preventDefault();
    }

    ngAfterViewInit() {
        window.setTimeout(() => {
            if (this.focusAfterAttached) {
                this.input.element.nativeElement.focus();
                this.input.element.nativeElement.select();
            }
        });
    }

    // when we tab into this editor, we want to focus the contents
    focusIn() {
        this.input.element.nativeElement.focus();
        this.input.element.nativeElement.select();
        console.log('NumericCellEditor.focusIn()');
    }
}