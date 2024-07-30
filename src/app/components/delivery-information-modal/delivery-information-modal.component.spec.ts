import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryInformationModalComponent } from './delivery-information-modal.component';

describe('DeliveryInformationModalComponent', () => {
  let component: DeliveryInformationModalComponent;
  let fixture: ComponentFixture<DeliveryInformationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryInformationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
