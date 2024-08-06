import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierQuoteDetailsComponent } from './supplier-quote-details.component';

describe('SupplierQuoteDetailsComponent', () => {
  let component: SupplierQuoteDetailsComponent;
  let fixture: ComponentFixture<SupplierQuoteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierQuoteDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierQuoteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
