import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { TeamMember } from '../../model/team-member.model'; // Ensure the path is correct
import { CommonModule } from '@angular/common';
import { MatListOption } from '@angular/material/list';

@Component({
    selector: 'app-addmember',
    standalone: true,
    imports: [MaterialModule, CommonModule],
    templateUrl: './addmember.component.html',
    styleUrls: ['./addmember.component.css'],
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

    onAddClick(selectedOptions: MatListOption[]): void {
        // Map from MatListOption to TeamMember by extracting the value property
        const selectedMembers: TeamMember[] = selectedOptions.map((option) => option.value);
        this.dialogRef.close(selectedMembers); // Pass back the TeamMember array
    }
}
