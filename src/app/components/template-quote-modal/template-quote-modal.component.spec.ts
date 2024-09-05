import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomQuoteModalComponent } from './custom-quote-modal.component';

describe('CustomQuoteModalComponent', () => {
  let component: CustomQuoteModalComponent;
  let fixture: ComponentFixture<CustomQuoteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomQuoteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomQuoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
