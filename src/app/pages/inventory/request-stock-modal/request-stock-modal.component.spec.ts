import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestStockModalComponent } from './request-stock-modal.component';

describe('RequestStockModalComponent', () => {
  let component: RequestStockModalComponent;
  let fixture: ComponentFixture<RequestStockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestStockModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestStockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
