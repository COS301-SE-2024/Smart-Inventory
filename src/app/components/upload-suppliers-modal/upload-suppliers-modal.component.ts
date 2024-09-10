import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-suppliers-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './upload-suppliers-modal.component.html',
  styleUrls: ['./upload-suppliers-modal.component.css']
})
export class UploadSuppliersModalComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<UploadSuppliersModalComponent>,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      // Replace with your API endpoint for uploading suppliers
      this.http.post('/api/upload-suppliers', formData).subscribe(
        (response) => {
          this.snackBar.open('Suppliers uploaded successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        (error) => {
          this.snackBar.open('Error uploading suppliers', 'Close', { duration: 3000 });
        }
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}