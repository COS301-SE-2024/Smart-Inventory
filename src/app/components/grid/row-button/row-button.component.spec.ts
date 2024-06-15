import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowButtonComponent } from './row-button.component';

describe('RowButtonComponent', () => {
  let component: RowButtonComponent;
  let fixture: ComponentFixture<RowButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RowButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
