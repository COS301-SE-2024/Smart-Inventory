import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-view-qrcode-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './view-qrcode-modal.component.html',
  styleUrl: './view-qrcode-modal.component.css'
})
export class ViewQrcodeModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewQrcodeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { qrCode: string, sku: string, description: string }
  ) {}

  printQRCode() {
    const printContent = document.getElementById('qrCodePrintArea');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt!.document.write('<html><head><title>Print QR Code</title>');
    WindowPrt!.document.write('<style>body { font-family: Arial, sans-serif; text-align: center; } img { max-width: 100%; height: auto; }</style>');
    WindowPrt!.document.write('</head><body>');
    WindowPrt!.document.write(printContent!.innerHTML);
    WindowPrt!.document.write('</body></html>');
    WindowPrt!.document.close();
    WindowPrt!.focus();
    WindowPrt!.print();
    WindowPrt!.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}