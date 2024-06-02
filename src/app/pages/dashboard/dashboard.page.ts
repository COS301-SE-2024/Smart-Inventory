import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

interface TeamMember {
	id: number;
	name: string;
	role: string;
	selected: boolean;
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
		{ id: 1, name: 'Alice Johnson', role: 'Analyst', selected: false },
		{ id: 2, name: 'Bob White', role: 'Engineer', selected: false },
		{ id: 3, name: 'Carol Blue', role: 'Manager', selected: false }
	];
	teamMembers: TeamMember[] = []; // List to display in the dashboard
	searchQuery: string = '';

	constructor(private modalController: ModalController) { }

	ngOnInit() { }

	dismissModal() {
		this.modalController.dismiss();
	}

	saveSelection() {
		// Filter for selected members and add them to the teamMembers array if they are not already added
		const selectedMembers = this.members.filter(member => member.selected && !this.isMemberAlreadyAdded(member));
		this.teamMembers = [...this.teamMembers, ...selectedMembers];
		this.members.forEach(member => member.selected = false); // Reset selection
		this.dismissModal();
	}

	isMemberAlreadyAdded(member: TeamMember) {
		return this.teamMembers.some(tm => tm.id === member.id);
	}

	removeMember(memberToRemove: TeamMember) {
		this.teamMembers = this.teamMembers.filter(member => member.id !== memberToRemove.id);
	}

	showUserProfile() {
		console.log('User profile clicked');
	}
}
