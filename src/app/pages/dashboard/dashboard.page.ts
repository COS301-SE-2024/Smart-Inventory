import { Component, OnInit } from '@angular/core';
import { ModalController, IonModal } from '@ionic/angular';

interface TeamMember {
	id: number;
	name: string;
	role: string;
}

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.page.html',
	styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
	userName: string = 'John Doe';
	userRole: string = 'Admin';
	members: TeamMember[] = [
		{ id: 1, name: 'Alice Johnson', role: 'Analyst' },
		{ id: 2, name: 'Bob White', role: 'Engineer' },
		{ id: 3, name: 'Carol Blue', role: 'Manager' }
	];
	filteredMembers: TeamMember[] = [...this.members];
	teamMembers: TeamMember[] =[] ; // List to display in the dashboard
	searchQuery: string = '';

	constructor(private modalController: ModalController) { }

	ngOnInit() { }

	addMember(member: TeamMember) {
		this.teamMembers.push(member);
		console.log('Member added:', member);
	}

	selectMember(member: TeamMember) {
		this.teamMembers.push(member);
		this.modalController.dismiss();
		console.log('Member added:', member);
	}

	removeMember(memberToRemove: TeamMember) {
		this.teamMembers = this.teamMembers.filter(member => member.id !== memberToRemove.id);
	}

	showUserProfile() {
		console.log('wassgood');
	}
}
