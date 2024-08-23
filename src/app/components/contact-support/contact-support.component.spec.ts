import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSupportComponent } from './contact-support.component';

describe('ContactSupportComponent', () => {
  let component: ContactSupportComponent;
  let fixture: ComponentFixture<ContactSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
