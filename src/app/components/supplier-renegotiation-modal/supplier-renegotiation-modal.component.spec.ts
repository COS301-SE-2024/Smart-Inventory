import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRenegotiationModalComponent } from './supplier-renegotiation-modal.component';

describe('SupplierRenegotiationModalComponent', () => {
  let component: SupplierRenegotiationModalComponent;
  let fixture: ComponentFixture<SupplierRenegotiationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierRenegotiationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierRenegotiationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
