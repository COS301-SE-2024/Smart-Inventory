import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanQrcodeModalComponent } from './scan-qrcode-modal.component';

describe('ScanQrcodeModalComponent', () => {
  let component: ScanQrcodeModalComponent;
  let fixture: ComponentFixture<ScanQrcodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanQrcodeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanQrcodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
