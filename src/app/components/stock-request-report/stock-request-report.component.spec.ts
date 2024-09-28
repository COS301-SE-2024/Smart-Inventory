import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockRequestReportComponent } from './stock-request-report.component';

describe('StockRequestReportComponent', () => {
  let component: StockRequestReportComponent;
  let fixture: ComponentFixture<StockRequestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockRequestReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockRequestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
