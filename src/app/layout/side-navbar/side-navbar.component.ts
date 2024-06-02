import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.scss'],
})
export class SideNavbarComponent implements OnInit {

  isExpanded = false;

  toggleNavbar() {
    this.isExpanded = !this.isExpanded;
  }

  constructor() { }

  ngOnInit() { }

}
