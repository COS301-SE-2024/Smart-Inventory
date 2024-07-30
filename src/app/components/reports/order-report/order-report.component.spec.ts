import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderReportComponent } from './order-report.component';

describe('OrderReportComponent', () => {
  let component: OrderReportComponent;
  let fixture: ComponentFixture<OrderReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
