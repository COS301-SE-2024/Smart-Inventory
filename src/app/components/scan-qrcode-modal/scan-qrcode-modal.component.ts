import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Html5Qrcode } from "html5-qrcode";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-scan-qrcode-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './scan-qrcode-modal.component.html',
  styleUrls: ['./scan-qrcode-modal.component.css']
})
export class ScanQrcodeModalComponent implements OnInit {
  @ViewChild('qrScanner', { static: true }) qrScanner!: ElementRef;
  private html5QrCode: Html5Qrcode | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  private lastErrorTime: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ScanQrcodeModalComponent>,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initializeScanner();
  }

  async initializeScanner() {
    try {
      this.html5QrCode = new Html5Qrcode("qrScanner");
      await this.html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        this.onScanSuccess.bind(this),
        this.onScanFailure.bind(this)
      );
    } catch (err) {
      console.error("Error starting QR scanner:", err);
      this.errorMessage = `Error starting scanner: ${err}`;
    }
  }

  onScanSuccess(decodedText: string, decodedResult: any) {
    this.ngZone.run(() => {
      this.successMessage = "QR Code scanned successfully!";
      setTimeout(() => {
        this.stopScanner();
        this.dialogRef.close(decodedText);
      }, 1000);
    });
  }

  onScanFailure(error: string) {
    if (!error.includes("No QR code found") && !error.includes("NotFoundException")) {
      const now = Date.now();
      if (now - this.lastErrorTime > 5000) {
        this.errorMessage = `Scanning failed: No QR code Found`;
        this.lastErrorTime = now;
      }
    }
  }

  stopScanner() {
    if (this.html5QrCode && this.html5QrCode.isScanning) {
      this.html5QrCode.stop().catch(err => {
        console.error("Error stopping scanner:", err);
        this.errorMessage = `Error stopping scanner: ${err}`;
      });
    }
  }

  closeDialog() {
    this.stopScanner();
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.stopScanner();
  }
}