import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadItemsModalComponent } from './upload-items-modal.component';

describe('UploadItemsModalComponent', () => {
  let component: UploadItemsModalComponent;
  let fixture: ComponentFixture<UploadItemsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadItemsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadItemsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
