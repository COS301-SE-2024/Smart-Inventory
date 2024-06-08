import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TitleService } from '../../components/header/title.service';
import { MaterialModule } from '../../components/material/material.module';
import { CommonModule } from '@angular/common';
import { AddmemberComponent } from '../../components/modal/addmember/addmember.component';
import { TeamMember } from '../../components/model/team-member.model'; // Correct the import path
import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { FilterService } from '../../services/filter.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [MaterialModule, CommonModule, AddmemberComponent, BubblechartComponent, SaleschartComponent, BarchartComponent, DonutchartComponent]
})
export class DashboardComponent implements OnInit {

  tiles = [
    { text: 'Team', cols: 1, rows: 1, hasButton: true },
    { text: 'Summary', cols: 1, rows: 1 },
    { text: 'Quick Actions', cols: 1, rows: 1 },
    {
      text: '', cols: 1, rows: 2, members: [  // Increased rows span here
        { name: 'Alice', role: 'Developer' },
        { name: 'Bob', role: 'Designer' },
        { name: 'Charlie', role: 'Project Manager' }
      ]
    },
    { text: 'Tile 5', cols: 1, rows: 1, styleClass: 'clear-background' },
    { text: 'Tile 6', cols: 1, rows: 1 }
  ];

  members: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', role: 'Analyst', selected: false },
    { id: 2, name: 'Bob White', role: 'Engineer', selected: false },
    { id: 3, name: 'Carol Blue', role: 'Manager', selected: false }
  ];

  teamMembers: TeamMember[] = [];

  constructor(private dialog: MatDialog, private titleService: TitleService, private filterService: FilterService) { }

  setFilter(filter: string): void {
    this.filterService.changeFilter(filter);
  }

  ngOnInit() {
    this.titleService.updateTitle('Dashboard');
  }

  openAddMemberDialog() {
    const availableMembers = this.members.filter(member => !this.teamMembers.some(tm => tm.id === member.id));
    console.log(availableMembers);
    const dialogRef = this.dialog.open(AddmemberComponent, {
      width: '500px',
      height: '500px',
      data: { members: availableMembers }
    });

    dialogRef.afterClosed().subscribe(selectedMembers => {
      if (selectedMembers) {
        this.teamMembers = [...this.teamMembers, ...selectedMembers];
        selectedMembers.forEach((member: { selected: boolean; }) => member.selected = true); // Assuming you need to set 'selected' to true
      }
    });
  }

  isMemberAlreadyAdded(member: TeamMember): boolean {
    return this.teamMembers.some(tm => tm.id === member.id);
  }

  removeMember(memberToRemove: TeamMember): void {
    this.teamMembers = this.teamMembers.filter(member => member.id !== memberToRemove.id);
  }
}
