import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-qrcode-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './view-qrcode-modal.component.html',
  styleUrl: './view-qrcode-modal.component.css'
})
export class ViewQrcodeModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewQrcodeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { qrCode: string, sku: string }
  ) {}

  printQRCode() {
    const printContent = document.getElementById('qrCodeImage');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt!.document.write(printContent!.innerHTML);
    WindowPrt!.document.close();
    WindowPrt!.focus();
    WindowPrt!.print();
    WindowPrt!.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}