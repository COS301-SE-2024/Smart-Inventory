import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryReportComponent } from './inventory-report.component';

describe('InventoryReportComponent', () => {
  let component: InventoryReportComponent;
  let fixture: ComponentFixture<InventoryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
