import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSuppliersModalComponent } from './upload-suppliers-modal.component';

describe('UploadSuppliersModalComponent', () => {
  let component: UploadSuppliersModalComponent;
  let fixture: ComponentFixture<UploadSuppliersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadSuppliersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadSuppliersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
