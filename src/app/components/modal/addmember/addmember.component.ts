import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { TeamMember } from '../../model/team-member.model'; // Ensure the path is correct
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-addmember',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './addmember.component.html',
  styleUrls: ['./addmember.component.css']
})
export class AddmemberComponent {

  members!: any;
  constructor(
    public dialogRef: MatDialogRef<AddmemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: TeamMember[] }
  ) {
    this.members = data.members;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onAddClick(selectedMembers: any[]): void {
    this.dialogRef.close(selectedMembers.map(option => option.value));
  }

}
