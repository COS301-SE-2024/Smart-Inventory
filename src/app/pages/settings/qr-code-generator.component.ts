import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-qr-code-generator',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
    template: `
        <div *ngFor="let item of items; let i = index">
            <label>
                <input type="checkbox" [(ngModel)]="item.selected" (change)="updateSelectedItems()" />
                {{ item.name }} - {{ item.value }}
            </label>
        </div>
        <button (click)="generateQRCode()" [disabled]="!selectedItems.length">Generate QR Code</button>
    `,
})
export class QrCodeGeneratorComponent {
    items = [
        { id: 1, name: 'Option 1', value: 'Value 1', selected: false },
        { id: 2, name: 'Option 2', value: 'Value 2', selected: false },
        { id: 3, name: 'Option 3', value: 'Value 3', selected: false },
        { id: 4, name: 'Option 4', value: 'Value 4', selected: false },
    ];

    selectedItems: any[] = [];

    constructor(private dialog: MatDialog) {}

    updateSelectedItems() {
        this.selectedItems = this.items.filter((item) => item.selected);
    }

    generateQRCode() {
        if (this.selectedItems.length === 0) {
            alert('Please select at least one item.');
            return;
        }

        const qrData = JSON.stringify(this.selectedItems);
        QRCode.toDataURL(qrData, (error: any, url: string) => {
            if (error) {
                console.error(error);
                return;
            }
            this.openQRCodeDialog(url);
        });
    }

    openQRCodeDialog(qrCodeUrl: string) {
        const dialogRef = this.dialog.open(QRCodeDialogComponent, {
            data: { qrCodeUrl },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'download') {
                this.downloadQRCode(qrCodeUrl);
            }
        });
    }

    downloadQRCode(qrCodeUrl: string) {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = 'qrcode.png';
        link.click();
    }
}

@Component({
    selector: 'app-qr-code-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    template: `
        <h2 mat-dialog-title style="text-align:center">QR Code</h2>
        <mat-dialog-content style="display: flex; justify-content: center;">
            <img [src]="data.qrCodeUrl" alt="QR Code" />
        </mat-dialog-content>
        <mat-dialog-actions style="display: flex; justify-content: center;">
            <button mat-button [mat-dialog-close]="'cancel'" style="width:100px">Cancel</button>
            <button mat-button [mat-dialog-close]="'download'" cdkFocusInitial style="width:100px">Download</button>
        </mat-dialog-actions>
    `,
})
export class QRCodeDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { qrCodeUrl: string }) {}
}
