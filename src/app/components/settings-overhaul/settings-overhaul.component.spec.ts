import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsOverhaulComponent } from './settings-overhaul.component';

describe('SettingsOverhaulComponent', () => {
  let component: SettingsOverhaulComponent;
  let fixture: ComponentFixture<SettingsOverhaulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsOverhaulComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsOverhaulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
