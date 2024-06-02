import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SideNavbarComponent } from './side-navbar/side-navbar.component';

@NgModule({
  declarations: [SideNavbarComponent],
  imports: [
    CommonModule
  ],
  exports: [SideNavbarComponent]
})
export class LayoutModule { }
