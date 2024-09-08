import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRenegotationModalComponent } from './supplier-renegotation-modal.component';

describe('SupplierRenegotationModalComponent', () => {
  let component: SupplierRenegotationModalComponent;
  let fixture: ComponentFixture<SupplierRenegotationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierRenegotationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierRenegotationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
