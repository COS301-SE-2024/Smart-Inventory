import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryComponent } from './inventory-summary.component';

describe('InventorySummaryComponent', () => {
  let component: InventorySummaryComponent;
  let fixture: ComponentFixture<InventorySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
