import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQrcodeModalComponent } from './view-qrcode-modal.component';

describe('ViewQrcodeModalComponent', () => {
  let component: ViewQrcodeModalComponent;
  let fixture: ComponentFixture<ViewQrcodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQrcodeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewQrcodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
