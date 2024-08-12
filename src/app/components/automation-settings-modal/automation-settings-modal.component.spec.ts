import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationSettingsModalComponent } from './automation-settings-modal.component';

describe('AutomationSettingsModalComponent', () => {
  let component: AutomationSettingsModalComponent;
  let fixture: ComponentFixture<AutomationSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationSettingsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
