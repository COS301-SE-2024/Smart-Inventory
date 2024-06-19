import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddmemberComponent } from './addmember.component';

describe('AddmemberComponent', () => {
  let component: AddmemberComponent;
  let fixture: ComponentFixture<AddmemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddmemberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddmemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
