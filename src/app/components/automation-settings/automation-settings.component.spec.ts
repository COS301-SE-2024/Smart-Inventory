import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationSettingsComponent } from './automation-settings.component';

describe('AutomationSettingsComponent', () => {
  let component: AutomationSettingsComponent;
  let fixture: ComponentFixture<AutomationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
