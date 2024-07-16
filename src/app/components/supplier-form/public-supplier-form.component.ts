import { Component } from '@angular/core';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';

@Component({
  selector: 'app-public-supplier-form',
  standalone: true,
  imports: [SupplierFormComponent],
  template: '<app-supplier-form></app-supplier-form>',
  styles: ['']
})
export class PublicSupplierFormComponent {}